import { NativeEventType, NativeXHREventType, TraceEventHandler } from '../types/Event';
import { TracerOptions } from '../types/TracerOptions';
import { _global } from '../utils/global';
import EventEmitter from 'eventemitter3';
import { registerEvent } from '../utils/registerEvent';
import {
  handleNewImageError,
  handleUnhandledRejection,
  handleWindowError,
  handleXHRAbort,
  handleXHRError,
  handleXHRLoadEnd,
  handleXHRTimeout,
} from './events/handler';
import { TraceXMLHttpRequest, XHR_TRACER_DATA_KEY } from '../types/Http';
import { wrapHoc } from '../utils/instrument/wrapHoc';
import { getTimestamp, toString } from '../utils/common';
import wrapInstance from '../utils/instrument/wrapInstance';

class Tracer extends EventEmitter<TraceEventHandler> {
  constructor(options: TracerOptions) {
    super();
    this.register();
  }

  private register() {
    registerEvent({
      target: _global,
      eventName: NativeEventType.Error,
      handler: handleWindowError.bind(this),
      capture: true,
    });

    registerEvent({
      target: _global,
      eventName: NativeEventType.UnhandledRejection,
      handler: handleUnhandledRejection.bind(this),
    });

    wrapInstance<HTMLImageElement>({
      target: _global,
      instance: 'Image',
      handler: (target) =>
        registerEvent({
          target,
          eventName: NativeEventType.Error,
          handler: handleNewImageError.bind(this),
        }),
    });

    wrapInstance<XMLHttpRequest>({
      target: _global,
      instance: 'XMLHttpRequest',
      handler: (target) => {
        const sourceOpen = target.open;
        target.open = function () {
          const [method, url] = arguments;
          (this as TraceXMLHttpRequest)[XHR_TRACER_DATA_KEY] = {
            method: (method as string).toUpperCase(),
            url,
            request_headers: {},
          };
          sourceOpen.apply(this, arguments as any);
        };

        const sourceSend = target.send;

        target.send = function () {
          const [requestData] = arguments;
          // todo requestData为 formData 时，上报格式
          (this as TraceXMLHttpRequest)[XHR_TRACER_DATA_KEY].body = toString(requestData);
          sourceSend.apply(this, arguments as any);
        };

        registerEvent({
          target,
          eventName: NativeXHREventType.Error,
          handler: handleXHRError.bind(this, target as TraceXMLHttpRequest),
        });

        registerEvent({
          target,
          eventName: NativeXHREventType.Timeout,
          handler: handleXHRTimeout.bind(this, target as TraceXMLHttpRequest),
        });

        registerEvent({
          target,
          eventName: NativeXHREventType.Abort,
          handler: handleXHRAbort.bind(this, target as TraceXMLHttpRequest),
        });

        registerEvent({
          target,
          eventName: NativeXHREventType.LoadEnd,
          handler: handleXHRLoadEnd.bind(this, target as TraceXMLHttpRequest),
        });
      },
    });

    wrapHoc<typeof fetch>({
      target: _global,
      property: 'fetch',
      replace: (source) => {
        return function (this: Tracer, ...args: Parameters<typeof fetch>) {
          const [input, init] = args;
          const startTime = getTimestamp();
          const method = (init?.method as string)?.toUpperCase() || 'GET';
          const url =
            typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

          const traceParams: TraceHTTPParams = {
            method,
            url,
            timeStamp: startTime,
          };

          return source
            .apply(_global, args)
            .then((res) => {
              console.log(this);
              return res;
            })
            .catch((err) => {
              console.log('111', err, this);
              return Promise.reject(err);
            });
        }.bind(this);
      },
    });
  }

  processEvent(xxx, data) {
    this.emit(xxx, data);
  }
}

export default Tracer;
