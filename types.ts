export interface RpcRequest {
  jsonrpc: "2.0";
  method: string;
  id: number;
  params?: unknown[];
}

export interface RpcResponse<T> {
  jsonrpc: "2.0";
  id: number;
  result: T;
  error?: {
    code: number;
    message: string;
  } | null;
}

export interface NodeStats {
  active_streams: number;
  cpu_percent: number;
  current_index: number;
  file_size: number; // In bytes
  last_updated: number; // Unix timestamp
  packets_received: number;
  packets_sent: number;
  ram_total: number; // In bytes
  ram_used: number; // In bytes
  total_bytes: number;
  total_pages: number;
  uptime: number; // In seconds
}

export interface PodInfo {
  address: string;              // e.g. "147.93.179.46:9001"
  last_seen_timestamp: number;  // Unix timestamp
  pubkey: string;
  version: string;
}

export interface PodsResult {
  pods: PodInfo[];
  total_count: number;
}

export interface NodeData {
  ip: string;
  stats: NodeStats | null;
  pods: PodsResult | null;
  status: 'online' | 'offline' | 'loading';
  latency: number; // ms
  error?: string;
}

export enum SortOption {
  UPTIME = 'UPTIME',
  CPU = 'CPU',
  RAM = 'RAM',
  STORAGE = 'STORAGE',
  IP = 'IP'
}