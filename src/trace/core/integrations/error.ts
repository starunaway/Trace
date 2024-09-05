import ErrorStackParser from 'error-stack-parser';
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

      const { error, message } = event;
      const stackFrame = ErrorStackParser.parse(!target ? event : error)[0];

      EventHandler.emit(ProcessEventType.Error, {
        message: message || error.message,
        stackFrame,
        event,
      });
    },
    capture: true,
  });
}
