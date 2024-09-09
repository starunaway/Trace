import { NativeEventType, ProcessEventType } from '../../types/Event';
import { _global } from '../../utils/global';
import { EventHandler } from '../../utils/instrument/eventHandlers';
import { registerEvent } from '../../utils/registerEvent';

export function registerGlobalErrorIntegrations() {
  registerEvent({
    target: _global,
    eventName: NativeEventType.Error,
    handler: (event: ErrorEvent) => {
      const target = event.target || event.srcElement;
      if (
        target instanceof HTMLElement &&
        ['LINK', 'SCRIPT', 'IMG'].indexOf(target.nodeName) !== -1
      ) {
        return;
      }

      EventHandler.emit(ProcessEventType.Error, event);
    },
    capture: true,
  });
}
