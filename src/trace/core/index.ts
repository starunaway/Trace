import { NativeEvent, NativeXHREvent, TraceEventHandler } from '../types/Event';
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
import { TraceXMLHttpRequest } from '../types/Http';
import wrapInstance from './events/wrapInstance';
import { getTimestamp, toString } from '../utils/common';

class Tracer extends EventEmitter<TraceEventHandler> {
  constructor(options: TracerOptions) {
    super();
    this.register();
  }

  private register() {
    registerEvent({
      target: _global,
      eventName: NativeEvent.Error,
      handler: handleWindowError.bind(this),
      capture: true,
    });

    registerEvent({
      target: _global,
      eventName: NativeEvent.UnhandledRejection,
      handler: handleUnhandledRejection.bind(this),
    });

    wrapInstance<HTMLImageElement>({
      target: _global,
      instance: 'Image',
      handler: (target) =>
        registerEvent({
          target,
          eventName: NativeEvent.Error,
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
          (this as TraceXMLHttpRequest).traceParams = {
            method: (method as string).toUpperCase(),
            url,
          };
          sourceOpen.apply(this, arguments as any);
        };

        const sourceSend = target.send;

        target.send = function () {
          const [requestData] = arguments;
          // todo requestData为 formData 时，上报格式
          (this as TraceXMLHttpRequest).traceParams.requestData = toString(requestData);
          (this as TraceXMLHttpRequest).traceParams.timeStamp = getTimestamp();
          sourceSend.apply(this, arguments as any);
        };

        registerEvent({
          target,
          eventName: NativeXHREvent.Error,
          handler: handleXHRError.bind(this, target as TraceXMLHttpRequest),
        });

        registerEvent({
          target,
          eventName: NativeXHREvent.Timeout,
          handler: handleXHRTimeout.bind(this, target as TraceXMLHttpRequest),
        });

        registerEvent({
          target,
          eventName: NativeXHREvent.Abort,
          handler: handleXHRAbort.bind(this, target as TraceXMLHttpRequest),
        });

        registerEvent({
          target,
          eventName: NativeXHREvent.LoadEnd,
          handler: handleXHRLoadEnd.bind(this, target as TraceXMLHttpRequest),
        });
      },
    });

    // const xhrProto = XMLHttpRequest.prototype;
    // const send = xhrProto.send;

    // const xhr = new XMLHttpRequest();
    // xhr.onerror = function (e) {};
    // xhr.onabort = function (e) {};

    // xhr.ontimeout = function (e) {};
    // const open = xhrProto.open;
    // xhrProto.open = function () {
    //   console.log('xhrProto,open', arguments);

    //   const [method, url] = arguments;
    //   this.trackParams = {
    //     method: (method as string).toUpperCase(),
    //     url,
    //   };
    //   open.apply(this, arguments);
    // };
    // xhrProto.send = function () {
    //   console.log('xhrProto,send', arguments);

    //   this.addEventListener('error', (e) => {
    //     const { responseType, response, status, trackParams } = this;
    //     console.log('xhrProto,error', e, responseType, response, status, trackParams);
    //   });

    //   this.addEventListener('abort', (e) => {
    //     console.log('xhrProto,abort', e, this);
    //   });
    //   this.addEventListener('loadend', (e) => {
    //     const { responseType, response, status, trackParams } = this;
    //     console.log('xhrProto,loadend', responseType, response, status, trackParams);
    //   });
    //   this.addEventListener('timeout', (e) => {
    //     console.log('xhrProto,timeout', e, this);
    //   });

    //   send.apply(this, arguments);
    // };
  }
}

export default Tracer;
