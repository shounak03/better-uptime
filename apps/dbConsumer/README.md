# DB Consumer

The DB Consumer service reads website status updates from the Redis stream `betteruptime:website:status` and writes them to the PostgreSQL database.

## Features

- **Redis Stream Consumer**: Reads from `betteruptime:website:status` stream
- **Batch Processing**: Processes multiple status updates in batches for optimal performance
- **Error Handling**: Proper error handling with message acknowledgment only on success
- **Automatic Region Management**: Creates default region if it doesn't exist
- **2-minute Interval**: Processes messages every 2 minutes
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals properly

## Environment Variables

```bash
DB_CONSUMER_ID=db-consumer-1  # Unique consumer identifier
DATABASE_URL=postgresql://... # PostgreSQL connection string
REDIS_URL=redis://...         # Redis connection string
```

## Running the Service

```bash
# Install dependencies
bun install

# Start the consumer
bun run index.ts

# Development mode
bun run --watch index.ts
```

## How it Works

1. **Initialization**: Creates consumer groups and ensures default region exists
2. **Message Processing**: Reads status messages from Redis stream every 2 minutes
3. **Validation**: Validates message format and status values
4. **Database Insert**: Batch inserts validated status updates into `WebsiteTick` table
5. **Acknowledgment**: Acknowledges successfully processed messages

## Message Format

The consumer expects messages in this format:
```json
{
  "websiteId": "uuid",
  "status": "UP|DOWN|UNKNOWN",
  "responseTime": "1234",
  "checkedAt": "2024-01-01T12:00:00.000Z",
  "regionId": "us-east-1"
}
```

## Database Schema

Updates are stored in the `WebsiteTick` table:
```sql
CREATE TABLE WebsiteTick (
  id           UUID PRIMARY KEY,
  websiteId    UUID REFERENCES Website(id),
  regionId     UUID REFERENCES Region(id), 
  status       WebsiteStatus,
  responseTime INTEGER,
  timeAdded    TIMESTAMP
);
```