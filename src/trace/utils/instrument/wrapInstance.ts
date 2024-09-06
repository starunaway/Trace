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

  function wrapped(...args: any[]) {
    const instance = new source(...args);
    handler(instance);
    return instance;
  }

  wrapped.prototype = source.prototype;
  // inheritPrototype(wrapped, source);

  target[instance] = wrapped;
}

function inheritPrototype(child: any, parent: any) {
  const prototype = Object.create(parent.prototype); // 创建对象
  prototype.constructor = child; // 增强对象
  child.prototype = prototype; // 赋值对象
}
