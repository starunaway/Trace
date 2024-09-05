// export const enum XHR_STATUS {
//   Abort = 'abort',
//   Timeout = 'timeout',
//   Error = 'error',
//   LoadEnd = 'loadend',
// }

import { WebFetchHeaders } from './webfetchapi';

type XHRSendInput = unknown;

export const XHR_TRACER_DATA_KEY = '__traceParams__';
export interface TraceXHRData {
  method: string;
  url: string;
  status_code?: number;
  body?: XHRSendInput;
  request_body_size?: number;
  response_body_size?: number;
  request_headers: Record<string, string>;
}

export interface TraceXMLHttpRequest extends XMLHttpRequest {
  [XHR_TRACER_DATA_KEY]: TraceXHRData;
}

export interface HandlerDataXhr {
  xhr: TraceXMLHttpRequest;
  startTimestamp?: number;
  endTimestamp?: number;
}

interface TraceFetchData {
  method: string;
  url: string;
  request_body_size?: number;
  response_body_size?: number;
}

export interface HandlerDataFetch {
  args: any[];
  fetchData: TraceFetchData; // This data is among other things dumped directly onto the fetch breadcrumb data
  startTimestamp: number;
  endTimestamp?: number;
  // This is actually `Response` - Note: this type is not complete. Add to it if necessary.
  response?: {
    readonly ok: boolean;
    readonly status: number;
    readonly url: string;
    headers: WebFetchHeaders;
  };
  error?: unknown;
}
