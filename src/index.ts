#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { PrometheusClient } from './prometheus-client.js';
import { PrometheusConfig } from './types.js';
import { tools, handleToolCall } from './tools.js';

function createPrometheusConfig(): PrometheusConfig {
  return {
    baseUrl: process.env.PROMETHEUS_URL || 'http://localhost:9090',
    username: process.env.PROMETHEUS_USERNAME,
    password: process.env.PROMETHEUS_PASSWORD,
    token: process.env.PROMETHEUS_TOKEN,
    timeout: process.env.PROMETHEUS_TIMEOUT ? parseInt(process.env.PROMETHEUS_TIMEOUT) : 10000,
    insecure: process.env.PROMETHEUS_INSECURE === 'true',
  };
}

function createServer(): Server {
  return new Server(
    {
      name: 'prometheus-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}

async function main(): Promise<void> {
  const config = createPrometheusConfig();
  const prometheusClient = new PrometheusClient(config);
  const server = createServer();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    handleToolCall(request, prometheusClient)
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Prometheus MCP server running on stdio');
}

main().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('Server error:', errorMessage);
  process.exit(1);
});