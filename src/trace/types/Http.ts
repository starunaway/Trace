export const XHR_TRACER_DATA_KEY = '__traceParams__';
export interface TraceXHRData {
  method: string;
  url: string;
  status_code?: number;
  reqBody?: unknown;
  resBody?: unknown;
  reqHeaders?: Record<string, string>;
  resHeaders?: Record<string, string>;
}

export interface TraceXMLHttpRequest extends XMLHttpRequest {
  [XHR_TRACER_DATA_KEY]: TraceXHRData;
}

export interface HandlerDataXhr {
  xhr: TraceXMLHttpRequest;
  startTimestamp?: number;
  endTimestamp?: number;
}
