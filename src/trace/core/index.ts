import { ProcessEventType, TraceEventHandler } from '../types/Event';
import { TracerOptions } from '../types/TracerOptions';
import { _global } from '../utils/global';
import EventEmitter from 'eventemitter3';
import { registerResourceIntegrations } from './integrations/resource';
import { EventHandler } from '../utils/instrument/eventHandlers';
import { registerGlobalErrorIntegrations } from './integrations/error';
import { registerUnhandledRejection } from './integrations/unhandledRejection';
import { registerXHR } from './integrations/xhr';
import TraceOption from './option';
import { registerFetch } from './integrations/fetch';

class Tracer extends EventEmitter<TraceEventHandler> {
  options: TracerOptions;
  constructor(options: TracerOptions) {
    super();
    TraceOption.setOption(options);
    this.register();
    this.handleEvent();
    this.options = TraceOption.getOption();
  }

  private register() {
    registerResourceIntegrations();
    registerGlobalErrorIntegrations();
    registerUnhandledRejection();
    registerXHR();
    registerFetch();
  }

  /**
   * todo 捕获 react 错误
   * 可以从 error boundary 获取。 react19 的 createRoot 可以传入回调
   * @param error
   * @param info
   */
  static captureReactError(error: unknown, info: unknown) {
    console.log('captureReactError', error, info);
  }

  static getTraceOption() {
    return TraceOption.getOption();
  }

  private handleEvent() {
    EventHandler.on(ProcessEventType.Resource, (data) => {
      console.log('resource error', data);
    });

    EventHandler.on(ProcessEventType.Error, (data) => {
      console.log('error', data);
    });

    EventHandler.on(ProcessEventType.UnhandledRejection, (data) => {
      console.log('unhandledrejection', data);
    });
    EventHandler.on(ProcessEventType.XHR, (data) => {
      console.log('XHR', data);
    });
    EventHandler.on(ProcessEventType.Fetch, (data) => {
      console.log('Fetch', data);
    });
  }
}

export default Tracer;
