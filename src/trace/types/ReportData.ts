import { TraceEventType } from './Event';

export type ReportDataType = 'error' | 'http' | 'performance';

export interface ReportData<T> {
  eventId: string;
  timestamp: number;
  eventType: TraceEventType;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  data: T; // This will store all trace data
}
