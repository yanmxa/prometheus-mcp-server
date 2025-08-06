import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { 
  PrometheusConfig, 
  PrometheusResponse, 
  QueryResult, 
  TargetsResult,
  MetricMetadata
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

  async query(query: string, time?: string): Promise<PrometheusResponse<QueryResult>> {
    const params: Record<string, string> = { query };
    if (time) params.time = time;
    const response = await this.client.get<PrometheusResponse<QueryResult>>('/api/v1/query', { params });
    return response.data;
  }

  async range(query: string, start: string, end: string, step: string): Promise<PrometheusResponse<QueryResult>> {
    const response = await this.client.get<PrometheusResponse<QueryResult>>('/api/v1/query_range', {
      params: { query, start, end, step },
      timeout: 30000,
    });
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