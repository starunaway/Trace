/**
 * 浏览器事件类型
 */
export const enum NativeEventType {
  Error = 'error',
  UnhandledRejection = 'unhandledrejection',
  Fetch = 'fetch',
  Performance = 'performance',
}

/**
 * XMLHttpRequest 事件类型
 */
export const enum NativeXHREventType {
  Error = 'error',
  Abort = 'abort',
  Timeout = 'timeout',
  LoadEnd = 'loadend',
  ReadyStateChange = 'readystatechange',
}

/**
 * todo 这里应该上报处理后事件数据，而非原始事件
 */
export type TraceEventHandler = {
  [TraceEventType.Error]: (error: Error) => void;
  [TraceEventType.HTTP]: (xhr: XMLHttpRequest) => void;
  [TraceEventType.Performance]: (performance: Performance) => void;
};

/**
 * 自定义事件
 *
 */
export const enum TraceEventType {
  Error = 'error',
  HTTP = 'http',
  Performance = 'performance',
}

/**
 * 自定义事件数据
 */
export interface BaseTraceEvent {}
