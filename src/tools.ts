import { CallToolRequest, CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { PrometheusClient } from './prometheus-client.js';
import { 
  PromQueryArgs, 
  PromRangeArgs, 
  PromMetadataArgs, 
  PromTargetsArgs 
} from './types.js';

export const tools: Tool[] = [
  {
    name: 'prom_query',
    description: 'Execute a PromQL instant query',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'PromQL query expression' },
        time: { type: 'string', description: 'Evaluation timestamp (optional)' },
        includes: { type: 'array', items: { type: 'string' }, description: 'Metric properties to include in response (optional)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'prom_range',
    description: 'Execute a PromQL range query',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'PromQL query expression' },
        start: { type: 'string', description: 'Start timestamp' },
        end: { type: 'string', description: 'End timestamp' },
        step: { type: 'string', description: 'Step interval (e.g., "15s", "1m")' },
        includes: { type: 'array', items: { type: 'string' }, description: 'Metric properties to include in response (optional)' },
      },
      required: ['query', 'start', 'end', 'step'],
    },
  },
  {
    name: 'prom_discover',
    description: 'Discover all available metrics',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'prom_metadata',
    description: 'Get metric metadata',
    inputSchema: {
      type: 'object',
      properties: {
        metric: { type: 'string', description: 'Metric name (optional)' },
      },
    },
  },
  {
    name: 'prom_targets',
    description: 'Get scrape target information',
    inputSchema: {
      type: 'object',
      properties: {
        state: { type: 'string', enum: ['active', 'dropped', 'any'] },
      },
    },
  },
];

function isPromQueryArgs(args: unknown): args is PromQueryArgs {
  return typeof args === 'object' && args !== null && 'query' in args;
}

function isPromRangeArgs(args: unknown): args is PromRangeArgs {
  return typeof args === 'object' && args !== null && 
    'query' in args && 'start' in args && 'end' in args && 'step' in args;
}

function isPromMetadataArgs(args: unknown): args is PromMetadataArgs {
  return typeof args === 'object' && args !== null;
}

function isPromTargetsArgs(args: unknown): args is PromTargetsArgs {
  return typeof args === 'object' && args !== null;
}

export async function handleToolCall(
  request: CallToolRequest,
  prometheusClient: PrometheusClient
): Promise<CallToolResult> {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;
    
    switch (name) {
      case 'prom_query': {
        if (!isPromQueryArgs(args)) {
          throw new Error('Invalid arguments for prom_query');
        }
        const { query, time, includes } = args;
        result = await prometheusClient.query(query, time, includes);
        break;
      }
      case 'prom_range': {
        if (!isPromRangeArgs(args)) {
          throw new Error('Invalid arguments for prom_range');
        }
        const { query, start, end, step, includes } = args;
        result = await prometheusClient.range(query, start, end, step, includes);
        break;
      }
      case 'prom_discover': {
        result = await prometheusClient.discover();
        break;
      }
      case 'prom_metadata': {
        if (!isPromMetadataArgs(args)) {
          throw new Error('Invalid arguments for prom_metadata');
        }
        const { metric } = args as PromMetadataArgs;
        result = await prometheusClient.metadata(metric);
        break;
      }
      case 'prom_targets': {
        if (!isPromTargetsArgs(args)) {
          throw new Error('Invalid arguments for prom_targets');
        }
        const { state } = args as PromTargetsArgs;
        result = await prometheusClient.targets(state);
        break;
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
}