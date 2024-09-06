import { isError, isFunction } from 'lodash-es';
import { TraceFetchData } from '../../types/Http';
import { convertHeadersToObject, getTimestamp, shouldHTTPReport } from '../../utils/common';
import { _global } from '../../utils/global';
import { wrapHoc } from '../../utils/instrument/wrapHoc';
import TraceOption from '../option';
import { EventHandler } from '../../utils/instrument/eventHandlers';
import { ProcessEventType } from '../../types/Event';
import ErrorStackParser from 'error-stack-parser';

export function registerFetch() {
  wrapHoc<typeof fetch>({
    target: _global,
    property: 'fetch',
    replace: (source) => {
      return function (...args: Parameters<typeof fetch>) {
        const [input, init] = args;
        const startTime = getTimestamp();
        const method = (init?.method as string)?.toUpperCase() || 'GET';
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        const traceParams: TraceFetchData = {
          method,
          url,
          startTimeStamp: startTime,
          reqBody: init && init.body,
          reqHeaders: init?.headers && convertHeadersToObject(init?.headers),
        };

        const headers = new Headers(init?.headers || {});
        Object.assign(headers, {
          setRequestHeader: headers.set,
        });
        const config = Object.assign({}, init, headers);

        const virtualStackTrace = new Error().stack;

        return source
          .apply(_global, [input, config])
          .then((res) => {
            const tempRes = res.clone();
            console.log(tempRes);

            if (!shouldHTTPReport(url, method, tempRes.status)) {
              return res;
            }

            traceParams.status = tempRes.status;
            traceParams.elapsedTime = getTimestamp() - traceParams.startTimeStamp!;
            traceParams.resHeaders = convertHeadersToObject(tempRes.headers);
            tempRes.text().then((data: any) => {
              traceParams.resBody = data;

              EventHandler.emit(ProcessEventType.Fetch, {
                ...traceParams,
              });
            });
            return res;
          })
          .catch((error) => {
            if (!shouldHTTPReport(url, method, 0)) {
              return Promise.reject(error);
            }
            let err;
            if (typeof error === 'string') {
              err = new Error(error);
              err.stack = virtualStackTrace;
            } else if (isError(error) && error.stack === undefined) {
              err = new Error(error.message);
              err.stack = virtualStackTrace;
              err.name = error.name;
            } else {
              err = error;
            }

            traceParams.elapsedTime = getTimestamp() - traceParams.startTimeStamp!;

            EventHandler.emit(ProcessEventType.Fetch, {
              ...traceParams,
              elapsedTime: getTimestamp() - traceParams.startTimeStamp!,
              error: err,
            });

            throw err;
          });
      };
    },
  });
}
