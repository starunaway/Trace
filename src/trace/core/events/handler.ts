import ErrorStackParser from 'error-stack-parser';
import Tracer from '..';
import { TraceXMLHttpRequest, XHR_STATUS } from '../../types/Http';

export function handleWindowError(this: Tracer, event: ErrorEvent) {
  console.log('handleWindowError', event);
  const target = event.target || event.srcElement;
  if (target instanceof HTMLElement && ['LINK', 'SCRIPT', 'IMG'].indexOf(target.nodeName) !== -1) {
    // 下载资源失败
    // @ts-ignore
    const src = target.src || target.href;
    // window.location.href.indexOf(src) !== 0的原因是当img标签为空时候，也会监听报错，所以排除掉。
    if (window.location.href.indexOf(src) !== 0) {
      this.emit('error', {
        type: 'resource',
        url: src,
        nodeName: target.nodeName.toLowerCase(),
      });
    }

    return;
  }

  const { error, message, colno, lineno, filename } = event;
  const stackFrame = ErrorStackParser.parse(!target ? event : error)[0];
  const { fileName, columnNumber, lineNumber } = stackFrame;

  console.log(stackFrame);
  this.emit('error', {
    type: 'error',
    ...stackFrame,
    fileName: filename || fileName,
    columnNumber: colno || columnNumber,
    lineNumber: lineno || lineNumber,
    message: message || error.message,
  });
}

export function handleUnhandledRejection(this: Tracer, event: PromiseRejectionEvent) {
  const { reason } = event;
  if (reason instanceof Error) {
    const stackFrame = ErrorStackParser.parse(event.reason)[0];
    console.log(stackFrame);
    this.emit('error', {
      type: 'promiseError',
      ...stackFrame,
    });
  } else {
    this.emit('error', {
      type: 'promiseError',
      reason,
    });
  }
}

export function handleNewImageError(this: Tracer, event: ErrorEvent) {
  console.log('handleNewImageError', this, event, event.target);
  const { target } = event;
  const src = (target as HTMLImageElement).src;

  this.emit('error', {
    type: 'resource',
    subTYpe: 'newImage',
    url: src,
    nodeName: (target as HTMLImageElement)!.nodeName.toLowerCase(),
  });
}

export function handleXHRError(
  this: Tracer,
  target: TraceXMLHttpRequest,
  event: ProgressEvent<XMLHttpRequestEventTarget>
) {
  target.traceParams.xhrStatus = XHR_STATUS.Error;
  const { method, url, requestData } = target.traceParams;

  console.log('handleXHRError', target, event);
  this.emit('http', {
    type: 'error',
    method,
    url,
    subType: 'xhr',
    requestData,
  });
}

export function handleXHRAbort(
  this: Tracer,
  target: TraceXMLHttpRequest,
  event: ProgressEvent<XMLHttpRequestEventTarget>
) {
  target.traceParams.xhrStatus = XHR_STATUS.Abort;
  const { method, url, requestData } = target.traceParams;

  console.log('handleXHRAbort', target, event, this);

  this.emit('http', {
    type: 'abort',
    method,
    url,
    subType: 'xhr',
    requestData,
  });
}

export function handleXHRTimeout(
  this: Tracer,
  target: TraceXMLHttpRequest,
  event: ProgressEvent<XMLHttpRequestEventTarget>
) {
  target.traceParams.xhrStatus = XHR_STATUS.Timeout;
  const { method, url, requestData } = target.traceParams;

  console.log('handleXHRTimeout', target, event, this);

  this.emit('http', {
    type: 'timeout',
    method,
    url,
    subType: 'xhr',
    requestData,
  });
}

export function handleXHRLoadEnd(
  this: Tracer,
  target: TraceXMLHttpRequest,
  event: ProgressEvent<XMLHttpRequestEventTarget>
) {
  const { method, url, xhrStatus } = target.traceParams;

  if (
    [XHR_STATUS.Abort, XHR_STATUS.Timeout, XHR_STATUS.Error].indexOf(xhrStatus as XHR_STATUS) > -1
  ) {
    return;
  }
  const { responseType, response, status } = target;

  if (['', 'json', 'text'].includes(responseType)) {
    // todo: 上报响应体
    // const { checkHttpStatus } = options.get();
    // if (isFunction(checkHttpStatus)) {
    //   this.trackParams.response = response && JSON.parse(response);
    // }
  }

  //   console.log('handleXHRLoadEnd', target, responseType, response, status, this);
  if (status >= 400) {
    this.emit('http', {
      type: 'statusError',
      method,
      url,
      subType: 'xhr',
      responseData: response,
      responseType,
      status,
    });
  }
}
