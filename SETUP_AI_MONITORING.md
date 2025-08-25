# AI-Based Log Monitoring Setup Guide

This guide will help you set up the AI-powered failure analysis feature for your Better Uptime monitoring system.

## Prerequisites

1. **OpenAI API Key**: Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. **Database Access**: Ensure your PostgreSQL database is running
3. **Redis**: Ensure Redis is running for the message queuing system

## Installation Steps

### 1. Environment Variables

Add the following environment variable to your system:

```bash
# Add to your .env file or export directly
export OPENAI_API_KEY="your_openai_api_key_here"
```

### 2. Database Migration

Run the Prisma migration to add the new AI analysis tables:

```bash
cd packages/db
bunx prisma migrate dev --name add_ai_analysis_fields
bunx prisma generate
```

### 3. Install Dependencies

Install the new AI analyzer dependencies:

```bash
cd apps/ai-analyzer
bun install
```

### 4. Start the Services

You'll need to run these services in order:

1. **Start the enhanced worker** (collects detailed monitoring data):
```bash
cd apps/worker
bun start
```

2. **Start the AI analyzer** (processes failures and generates insights):
```bash
cd apps/ai-analyzer
bun start
```

3. **Start the database consumer** (saves data to database):
```bash
cd apps/dbConsumer
bun start
```

4. **Start the backend API**:
```bash
cd apps/backend
bun start
```

5. **Start the frontend**:
```bash
cd apps/frontend
bun dev
```

## Features Enabled

### Enhanced Data Collection
- **HTTP Status Codes**: Detailed error codes (404, 500, etc.)
- **Error Classification**: Automatic categorization (DNS, SSL, Network, etc.)
- **Response Headers**: Server information for debugging
- **DNS Resolution Time**: Network performance metrics
- **SSL Certificate Info**: Security status and expiry dates

### AI-Powered Analysis
- **Intelligent Failure Classification**: Frontend vs Backend vs Network issues
- **Severity Assessment**: Critical, High, Medium, Low priority levels
- **Human-Readable Summaries**: Clear explanations in plain English
- **Actionable Recommendations**: Step-by-step troubleshooting guides
- **Confidence Scoring**: AI confidence levels for transparency

### Enhanced Dashboard
- **Real-time AI Insights**: Immediate failure analysis on the dashboard
- **Detailed Error Information**: HTTP codes, error types, and messages
- **Historical Analysis**: Track patterns and recurring issues
- **Smart Alerts**: Context-aware notifications with AI recommendations

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Enhanced      │    │     Redis       │    │   AI Analyzer   │
│   Worker        │───▶│     Stream      │───▶│   (OpenAI)      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       ▼
         │                       │              ┌─────────────────┐
         │                       │              │    Database     │
         │                       │              │   (Enhanced)    │
         │                       │              └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   DB Consumer   │◀─────────────┘
         │              │                 │
         │              └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│    Frontend     │◀───│    Backend      │
│   (Dashboard)   │    │      API        │
└─────────────────┘    └─────────────────┘
```

## Testing the System

1. Add a website to monitor through the dashboard
2. Wait for a failure event (or test with an invalid URL)
3. Check the detailed website view to see:
   - Enhanced error information
   - AI-generated failure analysis
   - Recommended actions

## Cost Considerations

- **OpenAI API Usage**: Approximately $0.01-0.03 per failure analysis
- **Token Optimization**: Analysis limited to essential data only
- **Fallback System**: Rule-based analysis when AI is unavailable

## Troubleshooting

### Common Issues

1. **AI Analysis Not Appearing**:
   - Check OpenAI API key is set correctly
   - Verify AI analyzer service is running
   - Check Redis connectivity

2. **Enhanced Data Missing**:
   - Ensure enhanced worker is running
   - Verify database migration completed successfully
   - Check Redis stream connectivity

3. **Performance Issues**:
   - Monitor OpenAI API rate limits
   - Consider implementing caching for repeated analyses
   - Scale workers horizontally if needed

### Logs to Check

- **Worker**: Enhanced monitoring data collection
- **AI Analyzer**: OpenAI API calls and analysis results
- **Database**: Storage of enhanced monitoring data
- **Frontend**: Display of AI insights

## Future Enhancements

- **Pattern Recognition**: Detect recurring failure patterns
- **Predictive Analysis**: Forecast potential issues
- **Custom AI Models**: Train models on your specific infrastructure
- **Integration Alerts**: Connect with Slack, PagerDuty, etc.
- **Performance Optimization**: Reduce API costs with smart caching
