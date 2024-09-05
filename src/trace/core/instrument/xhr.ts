import { isString } from 'lodash';
import { TraceXMLHttpRequest, XHR_TRACER_DATA_KEY, HandlerDataXhr } from '../../types/Http';
import { getTimestamp, toString } from '../../utils/common';
import { _global } from '../../utils/global';
import { triggerHandlers, addHandler, maybeInstrument } from '../../utils/instrument/handlers';

export function addXhrInstrumentationHandler(handler: (data: HandlerDataXhr) => void): void {
  const type = 'xhr';
  addHandler(type, handler);
  maybeInstrument(type, instrumentXHR);
}

export function instrumentXHR() {
  if (!_global.XMLHttpRequest) {
    return;
  }

  const xhrproto = XMLHttpRequest.prototype;

  // eslint-disable-next-line @typescript-eslint/unbound-method
  xhrproto.open = new Proxy(xhrproto.open, {
    apply(originalOpen, xhrOpenThisArg: TraceXMLHttpRequest, xhrOpenArgs) {
      const startTimestamp = getTimestamp();

      // open() should always be called with two or more arguments
      // But to be on the safe side, we actually validate this and bail out if we don't have a method & url
      const method = isString(xhrOpenArgs[0]) ? xhrOpenArgs[0].toUpperCase() : undefined;
      const url = toString(xhrOpenArgs[1]);

      if (!method || !url) {
        return originalOpen.apply(xhrOpenThisArg, xhrOpenArgs as any);
      }

      xhrOpenThisArg[XHR_TRACER_DATA_KEY] = {
        method,
        url,
        request_headers: {},
      };

      const onreadystatechangeHandler: () => void = () => {
        // For whatever reason, this is not the same instance here as from the outer method
        const xhrInfo = xhrOpenThisArg[XHR_TRACER_DATA_KEY];

        if (!xhrInfo) {
          return;
        }

        if (xhrOpenThisArg.readyState === 4) {
          try {
            // touching statusCode in some platforms throws
            // an exception
            xhrInfo.status_code = xhrOpenThisArg.status;
          } catch (e) {
            /* do nothing */
          }

          const handlerData: HandlerDataXhr = {
            endTimestamp: getTimestamp(),
            startTimestamp,
            xhr: xhrOpenThisArg,
          };

          triggerHandlers('xhr', handlerData);
        }
      };

      if (
        'onreadystatechange' in xhrOpenThisArg &&
        typeof xhrOpenThisArg.onreadystatechange === 'function'
      ) {
        xhrOpenThisArg.onreadystatechange = new Proxy(xhrOpenThisArg.onreadystatechange, {
          apply(originalOnreadystatechange, onreadystatechangeThisArg, onreadystatechangeArgArray) {
            onreadystatechangeHandler();
            return originalOnreadystatechange.apply(
              onreadystatechangeThisArg,
              onreadystatechangeArgArray as any
            );
          },
        });
      } else {
        xhrOpenThisArg.addEventListener('readystatechange', onreadystatechangeHandler);
      }

      // Intercepting `setRequestHeader` to access the request headers of XHR instance.
      // This will only work for user/library defined headers, not for the default/browser-assigned headers.
      // Request cookies are also unavailable for XHR, as `Cookie` header can't be defined by `setRequestHeader`.
      xhrOpenThisArg.setRequestHeader = new Proxy(xhrOpenThisArg.setRequestHeader, {
        apply(
          originalSetRequestHeader,
          setRequestHeaderThisArg: TraceXMLHttpRequest,
          setRequestHeaderArgs: unknown[]
        ) {
          console.log('setRequestHeaderArgs', setRequestHeaderArgs);
          const [header, value] = setRequestHeaderArgs;

          const xhrInfo = setRequestHeaderThisArg[XHR_TRACER_DATA_KEY];

          if (xhrInfo && isString(header) && isString(value)) {
            xhrInfo.request_headers[header.toLowerCase()] = value;
          }

          return originalSetRequestHeader.apply(
            setRequestHeaderThisArg,
            setRequestHeaderArgs as any
          );
        },
      });

      return originalOpen.apply(xhrOpenThisArg, xhrOpenArgs as any);
    },
  });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  xhrproto.send = new Proxy(xhrproto.send, {
    apply(originalSend, sendThisArg: TraceXMLHttpRequest, sendArgs: unknown[]) {
      const sentryXhrData = sendThisArg[XHR_TRACER_DATA_KEY];

      if (!sentryXhrData) {
        return originalSend.apply(sendThisArg, sendArgs as any);
      }

      if (sendArgs[0] !== undefined) {
        sentryXhrData.body = sendArgs[0];
      }

      const handlerData: HandlerDataXhr = {
        startTimestamp: getTimestamp(),
        xhr: sendThisArg,
      };
      triggerHandlers('xhr', handlerData);

      return originalSend.apply(sendThisArg, sendArgs as any);
    },
  });
}
