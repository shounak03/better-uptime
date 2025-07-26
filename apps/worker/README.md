# Website Monitoring Worker

This worker implements a parallel Redis stream-based architecture for website status monitoring that separates website checking from database updates for optimal performance.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Website       │    │     Redis       │    │    Database     │
│   Checker       │───▶│     Stream      │───▶│    Consumer     │
│   Worker        │    │   (Status)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

1. **Website Checker Worker** (`index.ts`)
   - Reads website URLs from Redis stream (`betteruptime:website`)
   - Performs HTTP checks with retries and timeout
   - Writes status results to Redis stream (`betteruptime:website:status`)
   - Runs independently and can be scaled horizontally

2. **Database Consumer** (`db-consumer.ts`)
   - Reads status updates from Redis stream (`betteruptime:website:status`)
   - Batch processes status updates into PostgreSQL database
   - Handles database transactions and error recovery
   - Runs independently from website checker

3. **Parallel Orchestrator** (`start-parallel.ts`)
   - Starts both processes simultaneously
   - Manages process lifecycle and auto-restart
   - Provides graceful shutdown handling

## Features

- **Parallel Processing**: Website checking and database writes happen independently
- **Fault Tolerance**: Redis streams provide message durability and replay capability
- **Horizontal Scaling**: Multiple workers can process different websites simultaneously
- **Batch Processing**: Database writes are batched for optimal performance
- **Error Recovery**: Failed messages are retained and can be retried
- **Response Time Tracking**: Monitors and stores website response times

## Environment Variables

```bash
REGION_ID=us-east-1           # Geographic region identifier
WORKER_ID=worker-1            # Unique worker instance identifier  
DB_CONSUMER_ID=db-consumer-1  # Unique database consumer identifier
DATABASE_URL=postgresql://... # PostgreSQL connection string
REDIS_URL=redis://...         # Redis connection string
```

## Running the Worker

### Start Everything (Recommended)
```bash
bun run start
```

### Start Individual Components
```bash
# Website checker only
bun run worker

# Database consumer only  
bun run db-consumer

# Development mode with auto-restart
bun run dev
```

## Redis Streams

### Input Stream: `betteruptime:website`
Messages contain website URLs to check:
```json
{
  "id": "website-uuid",
  "url": "example.com"
}
```

### Output Stream: `betteruptime:website:status`
Status results from website checks:
```json
{
  "websiteId": "website-uuid",
  "status": "UP|DOWN|UNKNOWN",
  "regionId": "us-east-1", 
  "responseTime": "1234",
  "checkedAt": "2024-01-01T12:00:00.000Z"
}
```

## Database Schema

Status updates are stored in the `WebsiteTick` table:
```sql
CREATE TABLE WebsiteTick (
  id           UUID PRIMARY KEY,
  websiteId    UUID REFERENCES Website(id),
  regionId     UUID REFERENCES Region(id),
  status       WebsiteStatus,
  responseTime INTEGER,        -- Response time in milliseconds
  timeAdded    TIMESTAMP DEFAULT NOW()
);
```

## Scaling and Performance

### Horizontal Scaling
- Run multiple worker instances with different `WORKER_ID`
- Each worker processes different website batches
- Database consumers can also be scaled independently

### Performance Optimizations
- Batch database inserts (up to 10 records per transaction)
- Parallel website checking within each worker
- HTTP timeouts prevent hanging requests
- Redis streams provide efficient message queueing

### Monitoring
- Console logs provide real-time status updates
- Process exit codes indicate health status
- Redis stream lengths show queue depth
- Database metrics show throughput

## Error Handling

### Website Check Failures
- 3 automatic retries with exponential backoff
- 5-second HTTP timeout per request
- Failed checks marked as "DOWN" status

### Database Failures  
- Messages remain in Redis stream until successfully processed
- Batch transactions ensure consistency
- Auto-retry on connection failures

### Process Failures
- Automatic process restart after crashes
- Graceful shutdown on SIGINT/SIGTERM
- Consumer group state preserved in Redis

## Development

### Adding New Status Fields
1. Update `WebsiteStatusEvent` type in `redis-stream/index.ts`
2. Update database schema in `packages/db/prisma/schema.prisma`
3. Update `DatabaseStatus` interface in `db-consumer.ts`
4. Run `bunx prisma migrate dev`

### Testing
- Start Redis and PostgreSQL locally
- Set environment variables
- Run `bun run dev` for development mode
- Use Redis CLI to inspect stream contents

## Dependencies

- **Bun**: JavaScript runtime and package manager
- **Redis**: Message streaming and queueing
- **PostgreSQL**: Persistent status storage  
- **Prisma**: Database ORM and migrations
