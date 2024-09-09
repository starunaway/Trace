import { Contexts } from './context';
import { Exception } from './exception';
import { TraceFetchData, TraceXHRData } from './Http';

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
 * 自定义事件数据
 */
export interface BaseTraceEvent {
  event_id?: string;
  message?: string;
  timestamp?: number;
  startTimestamp?: number;
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

export const enum ProcessEventType {
  Resource = 'resource',
  Error = 'error',
  UnhandledRejection = 'unhandledrejection',
  XHR = 'xhr',
  Fetch = 'fetch',
}

export type Extra = unknown;
export type Extras = Record<string, Extra>;

export interface BaseEvent {
  exception?: {
    values?: Exception[];
  };
  contexts?: Contexts;
  extra?: Extras;
}

/**
 * 处理原生事件
 */
export type ProcessEventHandler = {
  [ProcessEventType.Resource]: (data: {
    url: string;
    nodeName: string;
    /**
     * 浏览器标签 或者 new Image 形式
     */
    type: 'dom' | 'new';
  }) => void;
  [ProcessEventType.Error]: (data: ErrorEvent) => void;
  [ProcessEventType.UnhandledRejection]: (
    data: PromiseRejectionEvent & {
      message?: string;
    }
  ) => void;
  [ProcessEventType.XHR]: (data: TraceXHRData) => void;
  [ProcessEventType.Fetch]: (data: TraceFetchData) => void;
};

export type ProcessEventData = Parameters<ProcessEventHandler[keyof ProcessEventHandler]>[0];

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
 * 聚合事件，用于上报 or 本地缓存
 */
export type TraceEventHandler = {
  [TraceEventType.Error]: (
    error:
      | Parameters<ProcessEventHandler[ProcessEventType.Resource]>[0]
      | Parameters<ProcessEventHandler[ProcessEventType.Error]>[0]
      | Parameters<ProcessEventHandler[ProcessEventType.UnhandledRejection]>[0]
  ) => void;
  [TraceEventType.HTTP]: (
    http:
      | Parameters<ProcessEventHandler[ProcessEventType.XHR]>[0]
      | Parameters<ProcessEventHandler[ProcessEventType.Fetch]>[0]
  ) => void;
  [TraceEventType.Performance]: (performance: Performance) => void;
};
