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
import { ReportData, ReportDataType } from '../types/ReportData';
import {
  ProcessEventHandler,
  ProcessEventType,
  TraceEventHandler,
  TraceEventType,
} from '../types/Event';
import { uuidv4 } from '../utils/uuid';
import BaseInfo from './baseInfo';
import Before from './helpers/decorator/before';

const eventTypeMap: Record<ProcessEventType, ReportDataType> = {
  [ProcessEventType.Error]: TraceEventType.Error,
  [ProcessEventType.UnhandledRejection]: TraceEventType.Error,
  [ProcessEventType.Resource]: TraceEventType.HTTP,
  [ProcessEventType.XHR]: TraceEventType.HTTP,
  [ProcessEventType.Fetch]: TraceEventType.HTTP,
};

console.log(eventTypeMap['xhr']);

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
   * ��以从 error boundary 获取。 react19 的 createRoot 可以传入回调
   * @param error
   * @param info
   */
  static captureReactError(error: unknown, info: unknown) {
    console.log('captureReactError', error, info);
  }

  static getTraceOption() {
    return TraceOption.getOption();
  }

  private createReportData<T extends keyof ProcessEventHandler>(
    type: T,
    data: Parameters<ProcessEventHandler[T]>[0]
  ): ReportData<Parameters<TraceEventHandler[keyof TraceEventHandler]>[0]> {
    const baseInfo = BaseInfo.getInstance();

    return {
      eventId: uuidv4(),
      timestamp: Date.now(),
      eventType: eventTypeMap[type] as TraceEventType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: baseInfo.getUserId(),
      sessionId: baseInfo.getSessionId(),
      data: data, // Store all trace data in the 'data' field
    };
  }

  // @Before
  private process(event: ProcessEventType, data: any) {
    console.log(data);
    const reportData = this.createReportData(event, data);
    this.emit(reportData.eventType, reportData as any);
  }

  private handleEvent() {
    EventHandler.on(ProcessEventType.Resource, (data) => {
      this.process(ProcessEventType.Resource, data);
    });

    EventHandler.on(ProcessEventType.Error, (data) => {
      this.process(ProcessEventType.Error, data);
    });

    EventHandler.on(ProcessEventType.UnhandledRejection, (data) => {
      this.process(ProcessEventType.UnhandledRejection, data);
    });

    EventHandler.on(ProcessEventType.XHR, (data) => {
      this.process(ProcessEventType.XHR, data);
    });

    EventHandler.on(ProcessEventType.Fetch, (data) => {
      this.process(ProcessEventType.Fetch, data);
    });
  }
}

export default Tracer;
