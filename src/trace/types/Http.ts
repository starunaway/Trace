export const enum XHR_STATUS {
  Abort = 'abort',
  Timeout = 'timeout',
  Error = 'error',
  LoadEnd = 'loadend',
}

export interface TraceHTTPParams {
  method: string;
  url: string;
  timeStamp?: number;
  requestData?: any;
  xhrStatus?: XHR_STATUS;
  httpStatus?: number;
}

export interface TraceXMLHttpRequest extends XMLHttpRequest {
  traceParams: TraceHTTPParams;
}
