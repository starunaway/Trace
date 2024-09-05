import EventEmitter from 'eventemitter3';
import { ProcessEventHandler } from '../../types/Event';

class ProcessEventEmitter extends EventEmitter<ProcessEventHandler> {}

export const EventHandler = new ProcessEventEmitter();
// export
