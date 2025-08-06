# Prometheus MCP Server

[![npm version](https://badge.fury.io/js/prometheus-mcp-server.svg)](https://www.npmjs.com/package/prometheus-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides seamless integration with Prometheus, enabling AI assistants to query metrics, discover available data, and analyze system performance through natural language interactions.

## Features

- **Real-time Metrics Access** - Query current and historical metrics data
- **Metrics Discovery** - Find available metrics and monitoring targets  
- **Multiple Auth Methods** - Basic auth, bearer tokens, and TLS support
- **Type-safe** - Full TypeScript implementation

## MCP Configuration

### Using npx (Recommended)

Add to your MCP client settings:

```json
{
  "mcpServers": {
    "prometheus": {
      "command": "npx",
      "args": ["prometheus-mcp-server"],
      "env": {
        "PROMETHEUS_URL": "http://localhost:9090"
      }
    }
  }
}
```

### Using global installation

First install the package globally:

```bash
npm install -g prometheus-mcp-server
```

Then configure your MCP client:

```json
{
  "mcpServers": {
    "prometheus": {
      "command": "prometheus-mcp-server",
      "env": {
        "PROMETHEUS_URL": "http://localhost:9090"
      }
    }
  }
}
```

## Environment Variables

```bash
# Required
PROMETHEUS_URL=http://localhost:9090

# Optional Authentication
PROMETHEUS_USERNAME=admin
PROMETHEUS_PASSWORD=password
PROMETHEUS_TOKEN=bearer-token

# Optional Connection
PROMETHEUS_TIMEOUT=10000
PROMETHEUS_INSECURE=false
```

## Available Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `prom_query` | Execute PromQL instant query | Get current metric values, alerts status |
| `prom_range` | Execute PromQL range query | Analyze trends, create graphs, historical data |
| `prom_discover` | Discover available metrics | Explore what metrics are available in your system |
| `prom_metadata` | Get metric metadata | Understand metric types, descriptions, and units |
| `prom_targets` | Get scrape targets info | Monitor scraping health and service discovery |

## Example Usage

Ask your AI assistant natural language questions:

- "What's the current CPU usage across all servers?"
- "Show me HTTP request rates for the last 6 hours"  
- "Which services have the highest memory consumption?"
- "Are there any failing health checks?"
- "What metrics are available for monitoring my database?"

## Development

```bash
# Run with inspector
npm run inspector

# Run directly
npm run dev
```

## Connection Methods

### 1. No Authentication
```bash
export PROMETHEUS_URL=http://localhost:9090
```

### 2. Basic Authentication
```bash
export PROMETHEUS_URL=http://localhost:9090
export PROMETHEUS_USERNAME=admin
export PROMETHEUS_PASSWORD=secret
```

### 3. Bearer Token
```bash
export PROMETHEUS_URL=https://prometheus.example.com:9090
export PROMETHEUS_TOKEN=your-bearer-token
```

### Additional Options

For self-signed certificates or development:
```bash
export PROMETHEUS_INSECURE=true
```


## License

MIT