import { isFunction } from 'lodash-es';

export const getTimestamp = () => Date.now();
export const toString = (target: any) => {
  if (isFunction(target?.toString)) {
    return target.toString();
  }
  return target;
};
