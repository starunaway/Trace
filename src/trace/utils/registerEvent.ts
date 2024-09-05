import isElement from 'lodash-es/isElement';
import isFunction from 'lodash-es/isFunction';
import isUndefined from 'lodash-es/isUndefined';
import { shouldDedupeEvent } from './dedupe';

interface RegisterParams<E extends Event = Event> {
  target: HTMLElement | Document | Window | XMLHttpRequest;
  eventName: string;
  handler: (e: E) => void;
  capture?: boolean;
}

const isAllowTarget = (target: any) =>
  isElement(target) || target === document || target === window || target instanceof XMLHttpRequest;

const validateEventListener = ({ target, eventName, handler }: RegisterParams<any>) => {
  // todo 不同类型的 targe 需要校验不同的 eventName
  // todo 比如 XMLHttpRequest 只能监听 load 事件
  // todo 需要进一步细化
  return isAllowTarget(target) && isFunction(handler) && !isUndefined(eventName);
};

export function registerEvent<E extends Event = Event>({
  target,
  eventName,
  handler,
  capture = false,
}: RegisterParams<E>) {
  const validate = validateEventListener({ target, eventName, handler });

  if (!validate) {
    return;
  }
  target.addEventListener(eventName, processEvent(handler) as EventListener, capture);
}

/**
 * todo 这里处理的是原生事件
 * 在某些情况下，比如去重 or 更详细的堆栈信息，需要在更外层去处理
 * @param handler 事件处理函数
 * @returns
 */
function processEvent(handler) {
  return function (e) {
    if (!shouldDedupeEvent(e)) {
      handler(e);
    }
  };
}
