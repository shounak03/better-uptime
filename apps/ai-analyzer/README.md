# AI Failure Analyzer

This service provides AI-powered analysis of website failures, generating intelligent summaries and recommendations for quick issue resolution.

## Features

- **Intelligent Failure Classification**: Automatically categorizes failures as Frontend, Backend, Network, DNS, SSL, etc.
- **Severity Assessment**: Rates the impact level from LOW to CRITICAL
- **Human-Readable Summaries**: Converts technical errors into clear explanations
- **Actionable Recommendations**: Provides specific steps to investigate and resolve issues
- **Confidence Scoring**: Shows AI confidence in the analysis

## AI Analysis Process

1. **Data Collection**: Receives enhanced monitoring data from Redis streams
2. **Historical Context**: Analyzes recent failure patterns and trends
3. **AI Processing**: Uses OpenAI GPT-4 to generate insights
4. **Fallback Logic**: Provides rule-based analysis when AI is unavailable
5. **Storage**: Saves results to database for dashboard display

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_connection_string
REDIS_URL=your_redis_connection_string
```

## Usage

```bash
# Install dependencies
bun install

# Start the analyzer
bun start
```

## AI Prompt Engineering

The service uses carefully crafted prompts to ensure consistent, actionable analysis:

- **Context-Aware**: Includes website info, error details, and historical data
- **Structured Output**: Enforces JSON format for reliable parsing
- **Fallback Handling**: Graceful degradation when AI is unavailable
- **Confidence Tracking**: Provides transparency in analysis quality
