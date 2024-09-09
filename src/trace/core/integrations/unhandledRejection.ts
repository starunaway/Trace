import { NativeEventType, ProcessEventType } from '../../types/Event';
import { _global } from '../../utils/global';
import { EventHandler } from '../../utils/instrument/eventHandlers';
import { registerEvent } from '../../utils/registerEvent';

export function registerUnhandledRejection() {
  registerEvent({
    target: _global,
    eventName: NativeEventType.UnhandledRejection,
    handler: (
      event: PromiseRejectionEvent & {
        message?: string;
      }
    ) => {
      let { reason } = event;
      if (reason instanceof Error) {
        event.message = event.message || reason.message;
      }

      EventHandler.emit(ProcessEventType.UnhandledRejection, event);
    },
  });
}
