import { isFunction } from 'lodash-es';
import TraceOption from '../core/option';

export const getTimestamp = () => Date.now();

export const shouldHTTPReport = (url: string, method: string, status: number): boolean => {
  const { checkDisabledUrl, checkDisabledHttpStatus } = TraceOption.getOption();

  if (isFunction(checkDisabledUrl) && checkDisabledUrl(url, method)) {
    return false;
  }

  if (isFunction(checkDisabledHttpStatus) && checkDisabledHttpStatus(status)) {
    return false;
  }

  return status >= 400 || status < 100;
};

export function convertHeadersToObject(headers: HeadersInit): Record<string, string> {
  const result: Record<string, string> = {};

  if (Array.isArray(headers)) {
    // 处理 [string, string][] 类型
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
  } else if (headers instanceof Headers) {
    // 处理 Headers 类型
    headers.forEach((value, key) => {
      result[key] = value;
    });
  } else {
    // 处理 Record<string, string> 类型
    Object.assign(result, headers);
  }

  return result;
}
