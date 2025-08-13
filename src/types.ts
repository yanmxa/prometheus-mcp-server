export interface PrometheusConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  token?: string;
  timeout?: number;
  insecure?: boolean;
}

export interface PromQueryArgs {
  query: string;
  time?: string;
  includes?: string[];
}

export interface PromRangeArgs {
  query: string;
  start: string;
  end: string;
  step: string;
  includes?: string[];
}

export interface PromMetadataArgs {
  metric?: string;
}

export interface PromTargetsArgs {
  state?: 'active' | 'dropped' | 'any';
}

export interface PrometheusResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  errorType?: string;
  error?: string;
  warnings?: string[];
}

export interface QueryResult {
  resultType: 'matrix' | 'vector' | 'scalar' | 'string';
  result: QueryData[];
}

export interface QueryData {
  metric?: Record<string, string>;
  value?: [number, string];
  values?: Array<[number, string]>;
}

export interface MetricMetadata {
  type: 'counter' | 'gauge' | 'histogram' | 'summary' | 'untyped';
  help: string;
  unit?: string;
}

export interface Target {
  discoveredLabels: Record<string, string>;
  labels: Record<string, string>;
  scrapePool: string;
  scrapeUrl: string;
  globalUrl: string;
  lastError: string;
  lastScrape: string;
  lastScrapeDuration: number;
  health: 'up' | 'down' | 'unknown';
}

export interface TargetsResult {
  activeTargets: Target[];
  droppedTargets: Target[];
}