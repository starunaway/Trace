import { NativeEventType, ProcessEventType } from '../../types/Event';
import { _global } from '../../utils/global';
import { EventHandler } from '../../utils/instrument/eventHandlers';
import wrapInstance from '../../utils/instrument/wrapInstance';
import { registerEvent } from '../../utils/registerEvent';

export function registerResourceIntegrations() {
  registerEvent({
    target: _global,
    eventName: NativeEventType.Error,
    handler: (event) => {
      const target = event.target || event.srcElement;
      if (
        target instanceof HTMLElement &&
        ['LINK', 'SCRIPT', 'IMG'].indexOf(target.nodeName) !== -1
      ) {
        // 下载资源失败
        // @ts-ignore
        const src = target.src || target.href;
        // window.location.href.indexOf(src) !== 0的原因是当img标签为空时候，也会监听报错，所以排除掉。
        if (window.location.href.indexOf(src) !== 0) {
          EventHandler.emit(ProcessEventType.Resource, {
            url: src,
            nodeName: target.nodeName.toLowerCase(),
            type: 'dom',
          });
        }
        return;
      }
    },
    capture: true,
  });

  wrapInstance<HTMLImageElement>({
    target: _global,
    instance: 'Image',
    handler: (target) =>
      registerEvent({
        target,
        eventName: NativeEventType.Error,
        handler: (event) => {
          const { target } = event;
          const src = (target as HTMLImageElement).src;

          EventHandler.emit(ProcessEventType.Resource, {
            url: src,
            nodeName: (target as HTMLImageElement)!.nodeName.toLowerCase(),
            type: 'new',
          });
        },
      }),
  });
}
