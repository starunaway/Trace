export const XHR_TRACER_DATA_KEY = '__traceParams__';
export const enum XHR_STATUS {
  Error,
  Timeout,
  Aborted,
}
export interface TraceXHRData {
  method: string;
  url: string;
  status?: number;
  reqBody?: unknown;
  resBody?: unknown;
  reqHeaders?: Record<string, string>;
  resHeaders?: Record<string, string>;
  tempStatus?: XHR_STATUS;
  startTimeStamp?: number;
  elapsedTime?: number;
  event?: ProgressEvent<XMLHttpRequestEventTarget>;
}

export interface TraceXMLHttpRequest extends XMLHttpRequest {
  [XHR_TRACER_DATA_KEY]: TraceXHRData;
}

export interface TraceFetchData {
  method: string;
  url: string;
  status?: number;
  reqBody?: unknown;
  resBody?: unknown;
  reqHeaders?: Record<string, string>;
  resHeaders?: Record<string, string>;
  startTimeStamp?: number;
  elapsedTime?: number;
  error?: Error;
}
