import { NativeXHREventType, ProcessEventType } from '../../types/Event';
import { _global } from '../../utils/global';
import { registerEvent } from '../../utils/registerEvent';
import { TraceXMLHttpRequest, XHR_STATUS, XHR_TRACER_DATA_KEY } from '../../types/Http';
import { EventHandler } from '../../utils/instrument/eventHandlers';
import { getTimestamp, shouldHTTPReport } from '../../utils/common';
import { isString, toString } from 'lodash-es';

export function registerXHR() {
  if (!(_global as any).XMLHttpRequest) {
    return;
  }

  const xhrProto = XMLHttpRequest.prototype;
  xhrProto.open = new Proxy(xhrProto.open, {
    apply(source, instance: TraceXMLHttpRequest, args) {
      const [method, url] = args;
      instance[XHR_TRACER_DATA_KEY] = {
        method: (method as string).toUpperCase(),
        url,
      };

      instance.setRequestHeader = new Proxy(instance.setRequestHeader, {
        apply(
          sourceSetRequestHeader,
          setRequestHeaderInstance: TraceXMLHttpRequest,
          setRequestHeaderArgArray: unknown[]
        ) {
          const [header, value] = setRequestHeaderArgArray;

          setRequestHeaderInstance[XHR_TRACER_DATA_KEY].reqHeaders =
            setRequestHeaderInstance[XHR_TRACER_DATA_KEY].reqHeaders || {};
          const reqHeaders = setRequestHeaderInstance[XHR_TRACER_DATA_KEY].reqHeaders;

          if (isString(header) && isString(value)) {
            reqHeaders[header.toLowerCase()] = value;
          }

          return sourceSetRequestHeader.apply(
            setRequestHeaderInstance,
            setRequestHeaderArgArray as any
          );
        },
      });

      registerEvent({
        target: instance,
        eventName: NativeXHREventType.Error,
        handler: (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
          instance[XHR_TRACER_DATA_KEY].tempStatus = XHR_STATUS.Error;
          instance[XHR_TRACER_DATA_KEY].event = event;
        },
      });

      registerEvent({
        target: instance,
        eventName: NativeXHREventType.Abort,
        handler: (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
          instance[XHR_TRACER_DATA_KEY].tempStatus = XHR_STATUS.Aborted;
          instance[XHR_TRACER_DATA_KEY].event = event;
        },
      });

      registerEvent({
        target: instance,
        eventName: NativeXHREventType.Timeout,
        handler: (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
          instance[XHR_TRACER_DATA_KEY].tempStatus = XHR_STATUS.Timeout;
          instance[XHR_TRACER_DATA_KEY].event = event;
        },
      });

      registerEvent({
        target: instance,
        eventName: NativeXHREventType.LoadEnd,
        handler: () => {
          const { responseType, response, status } = instance;

          if (!shouldHTTPReport(url, method, status)) {
            return;
          }

          if (['', 'json', 'text'].includes(responseType)) {
            instance[XHR_TRACER_DATA_KEY].resBody = response && JSON.parse(response);
          }

          const resHeadersStr = instance.getAllResponseHeaders();
          const resHeadersArr = resHeadersStr.trim().split(/[\r\n]+/);

          // Create a map of header names to values
          const resHeaders: Record<string, string> = {};
          resHeadersArr.forEach(function (line) {
            var parts = line.split(': ');
            var header = parts.shift();
            var value = parts.join(': ');
            resHeaders[header!] = value;
          });
          instance[XHR_TRACER_DATA_KEY].resHeaders = resHeaders;

          EventHandler.emit(ProcessEventType.XHR, {
            ...instance[XHR_TRACER_DATA_KEY],
            status,
            elapsedTime: getTimestamp() - instance[XHR_TRACER_DATA_KEY].startTimeStamp!,
          });
        },
      });

      return source.apply(instance, args as any);
    },
  });

  xhrProto.send = new Proxy(xhrProto.send, {
    apply(source, instance: TraceXMLHttpRequest, args) {
      if (!instance[XHR_TRACER_DATA_KEY]) {
        return source.apply(instance, args as any);
      }

      const [requestData] = args;
      instance[XHR_TRACER_DATA_KEY].reqBody = toString(requestData);
      instance[XHR_TRACER_DATA_KEY].startTimeStamp = getTimestamp();
      return source.apply(instance, args as any);
    },
  });
}
