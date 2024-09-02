import { isConstructable } from '../../utils/is';

interface WrapInstanceParams<T = unknown> {
  target: any;
  instance: string;
  handler: (instance: T) => void;
}

export default function wrapInstance<T = any>({
  target,
  instance,
  handler,
}: WrapInstanceParams<T>) {
  const source = target[instance];
  if (!isConstructable(source)) {
    return;
  }

  const wrapped = function (...args: any[]) {
    const instance = new source(...args);
    handler(instance);
    return instance;
  };

  wrapped.prototype = source.prototype;
  target[instance] = wrapped;
}
