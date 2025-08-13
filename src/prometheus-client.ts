import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { 
  PrometheusConfig, 
  PrometheusResponse, 
  QueryResult, 
  TargetsResult,
  MetricMetadata,
  QueryData
} from './types.js';

export class PrometheusClient {
  private client: AxiosInstance;

  constructor(config: PrometheusConfig) {
    const headers: Record<string, string> = {};
    
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`;
    }

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 10000,
      headers,
      auth: config.username && config.password ? {
        username: config.username,
        password: config.password
      } : undefined,
      httpsAgent: config.insecure ? new https.Agent({
        rejectUnauthorized: false
      }) : undefined,
    });
  }

  private filterQueryResult(result: QueryResult, includes?: string[]): QueryResult {
    if (!includes || includes.length === 0) {
      return result;
    }

    const filteredResult = result.result.map((data: QueryData) => {
      if (!data.metric) {
        return data;
      }

      const filteredMetric: Record<string, string> = {};
      
      // Always preserve __name__ if it exists
      if ('__name__' in data.metric) {
        filteredMetric['__name__'] = data.metric['__name__'];
      }
      
      // Add other requested properties
      for (const key of includes) {
        if (key in data.metric && key !== '__name__') {
          filteredMetric[key] = data.metric[key];
        }
      }

      return {
        ...data,
        metric: filteredMetric
      };
    });

    return {
      ...result,
      result: filteredResult
    };
  }

  async query(query: string, time?: string, includes?: string[]): Promise<PrometheusResponse<QueryResult>> {
    const params: Record<string, string> = { query };
    if (time) params.time = time;
    const response = await this.client.get<PrometheusResponse<QueryResult>>('/api/v1/query', { params });
    
    if (response.data.data && includes) {
      response.data.data = this.filterQueryResult(response.data.data, includes);
    }
    
    return response.data;
  }

  async range(query: string, start: string, end: string, step: string, includes?: string[]): Promise<PrometheusResponse<QueryResult>> {
    const response = await this.client.get<PrometheusResponse<QueryResult>>('/api/v1/query_range', {
      params: { query, start, end, step },
      timeout: 30000,
    });
    
    if (response.data.data && includes) {
      response.data.data = this.filterQueryResult(response.data.data, includes);
    }
    
    return response.data;
  }

  async discover(): Promise<PrometheusResponse<string[]>> {
    const response = await this.client.get<PrometheusResponse<string[]>>('/api/v1/label/__name__/values');
    return response.data;
  }

  async metadata(metric?: string): Promise<PrometheusResponse<Record<string, MetricMetadata[]>>> {
    const params: Record<string, string> = {};
    if (metric) params.metric = metric;
    const response = await this.client.get<PrometheusResponse<Record<string, MetricMetadata[]>>>('/api/v1/metadata', { params });
    return response.data;
  }

  async targets(state?: 'active' | 'dropped' | 'any'): Promise<PrometheusResponse<TargetsResult>> {
    const params: Record<string, string> = {};
    if (state) params.state = state;
    const response = await this.client.get<PrometheusResponse<TargetsResult>>('/api/v1/targets', { params });
    return response.data;
  }
}