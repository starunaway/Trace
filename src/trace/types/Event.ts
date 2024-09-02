/**
 * 浏览器事件
 */
export const enum NativeEvent {
  Error = 'error',
  UnhandledRejection = 'unhandledrejection',
  Fetch = 'fetch',
  Performance = 'performance',
}

export const enum NativeXHREvent {
  Error = 'error',
  Abort = 'abort',
  Timeout = 'timeout',
  LoadEnd = 'loadend',
}

export type TraceEventHandler = {
  [TraceEvent.Error]: (error: Error) => void;
  [TraceEvent.HTTP]: (xhr: XMLHttpRequest) => void;
  [TraceEvent.Performance]: (performance: Performance) => void;
};

/**
 * 自定义事件
 *
 * 用于上报
 */
export const enum TraceEvent {
  Error = 'error',
  HTTP = 'http',
  Performance = 'performance',
}
