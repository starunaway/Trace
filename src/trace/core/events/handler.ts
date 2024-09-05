import ErrorStackParser from 'error-stack-parser';
import Tracer from '..';
import { TraceXMLHttpRequest, XHR_TRACER_DATA_KEY } from '../../types/Http';
import { isDisabledUrl } from '../../utils/is';

export function handleWindowError(this: Tracer, event: ErrorEvent) {
  const target = event.target || event.srcElement;
  if (target instanceof HTMLElement && ['LINK', 'SCRIPT', 'IMG'].indexOf(target.nodeName) !== -1) {
    // 下载资源失败
    // @ts-ignore
    const src = target.src || target.href;
    // window.location.href.indexOf(src) !== 0的原因是当img标签为空时候，也会监听报错，所以排除掉。
    if (window.location.href.indexOf(src) !== 0) {
      this.processEvent('error', {
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

  this.processEvent('error', {
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
    const stackFrame = ErrorStackParser.parse(event.reason);
    this.processEvent('error', {
      type: 'promiseError',
      ...stackFrame[0],
    });
  } else {
    this.processEvent('error', {
      type: 'promiseError',
      reason,
    });
  }
}

export function handleNewImageError(this: Tracer, event: ErrorEvent) {
  const { target } = event;
  const src = (target as HTMLImageElement).src;

  this.processEvent('error', {
    type: 'resource',
    subTYpe: 'newImage',
    url: src,
    nodeName: (target as HTMLImageElement)!.nodeName.toLowerCase(),
  });
}

export function handleXHRError(this: Tracer, target: TraceXMLHttpRequest) {
  target[XHR_TRACER_DATA_KEY].status_code = target.status;
  const { method, url, body } = target[XHR_TRACER_DATA_KEY];
  if (isDisabledUrl(url)) {
    return;
  }
  this.processEvent('error', {
    type: 'error',
    method,
    url,
    subType: 'xhr',
    body,
  });
}

export function handleXHRAbort(this: Tracer, target: TraceXMLHttpRequest) {
  target[XHR_TRACER_DATA_KEY].status_code = target.status;
  const { method, url, body } = target[XHR_TRACER_DATA_KEY];

  if (isDisabledUrl(url)) {
    return;
  }
  this.processEvent('error', {
    type: 'abort',
    method,
    url,
    subType: 'xhr',
    body,
  });
}

export function handleXHRTimeout(this: Tracer, target: TraceXMLHttpRequest, e: Event) {
  target[XHR_TRACER_DATA_KEY].status_code = target.status;
  const { method, url, body } = target[XHR_TRACER_DATA_KEY];
  if (isDisabledUrl(url)) {
    return;
  }
  this.processEvent('error', {
    type: 'timeout',
    method,
    url,
    subType: 'xhr',
    body,
  });
}

export function handleXHRReadyStateChange(this: Tracer, target: TraceXMLHttpRequest, e: Event) {
  console.log('handleXHRReadyStateChange', target, e);
}

export function handleXHRLoadEnd(this: Tracer, target: TraceXMLHttpRequest) {
  const { method, url } = target[XHR_TRACER_DATA_KEY];

  if (isDisabledUrl(url)) {
    return;
  }
  if (target[XHR_TRACER_DATA_KEY].status_code !== 4) {
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

  //   todo 支持上报 header 内容

  //   console.log('handleXHRLoadEnd', target, responseType, response, status, this);
  if (status >= 400) {
    this.processEvent('error', {
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
