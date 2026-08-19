// src/lib/cloudwatch.ts

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  logGroup: string;
  action: string;
  details: Record<string, any>;
}

export interface OperationalMetrics {
  PostCreationCount: number;
  BookingAcceptanceRate: number;
  S3UploadSuccessCount: number;
  S3UploadFailureCount: number;
  APILatencyMs: number;
  ActiveBookingsCount: number;
}

// In-memory buffer of recent logs for demonstration / Admin Dashboard stream
const recentLogs: LogEntry[] = [];
const metrics: OperationalMetrics = {
  PostCreationCount: 14,
  BookingAcceptanceRate: 85.5, // percentage
  S3UploadSuccessCount: 32,
  S3UploadFailureCount: 1,
  APILatencyMs: 42,
  ActiveBookingsCount: 5,
};

export function logCloudWatch(
  action: string,
  details: Record<string, any> = {},
  level: 'INFO' | 'WARN' | 'ERROR' = 'INFO'
) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    logGroup: '/neighborhelp/app-logs',
    action,
    details,
  };

  // Keep last 100 log entries
  recentLogs.unshift(entry);
  if (recentLogs.length > 100) {
    recentLogs.pop();
  }

  // Print formatted JSON log to standard output (simulating CloudWatch agent forwarding)
  console.log(`[CloudWatch /neighborhelp/app-logs] ${JSON.stringify(entry)}`);
}

export function incrementMetric(metricName: keyof OperationalMetrics, amount = 1) {
  if (typeof metrics[metricName] === 'number') {
    metrics[metricName] += amount;
  }
}

export function updateMetric(metricName: keyof OperationalMetrics, value: number) {
  metrics[metricName] = value;
}

export function getCloudWatchLogs() {
  return recentLogs;
}

export function getCloudWatchMetrics() {
  return metrics;
}
