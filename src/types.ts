export interface User {
  id: number;
  username: string;
}

export interface MetricSample {
  id: number;
  ts: string;
  cpu_percent: number;
  mem_percent: number;
  disk_percent: number;
  net_rx_bytes: number;
  net_tx_bytes: number;
  uptime_seconds: number;
  load1: number | null;
}

export interface MetricsSummary {
  hostname: string;
  platform: string;
  collect_interval_seconds: number;
  total_samples: number;
  latest: MetricSample | null;
}
