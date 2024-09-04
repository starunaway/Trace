import { isFunction } from 'lodash-es';

interface WrapHOCParams<T = unknown> {
  target: any;
  property: string;
  replace: (source: T) => T;
}

export function wrapHoc<T = any>({ target, property, replace }: WrapHOCParams<T>) {
  if (!isFunction(replace)) {
    return;
  }

  const source = target[property];
  const wrapped = replace(source);
  if (!isFunction(wrapped)) {
    return;
  }

  target[property] = wrapped;
}
