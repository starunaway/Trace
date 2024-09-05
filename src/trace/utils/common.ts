import { isFunction, isString } from 'lodash-es';

export const getTimestamp = () => Date.now();
export const toString = (target: any) => {
  if (isString(target)) {
    return target;
  }
  if (isFunction(target?.toString)) {
    return target.toString();
  }
  return target;
};
