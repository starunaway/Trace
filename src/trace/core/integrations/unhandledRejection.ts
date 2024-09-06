import ErrorStackParser from 'error-stack-parser';
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
        stack?: ErrorStackParser.StackFrame[];
        message?: string;
      }
    ) => {
      let { reason } = event;
      if (reason instanceof Error) {
        const stackFrame = ErrorStackParser.parse(reason);
        (event as any).stack = stackFrame;
        event.message = event.message || reason.message;
      }

      EventHandler.emit(ProcessEventType.UnhandledRejection, event);
    },
  });
}
