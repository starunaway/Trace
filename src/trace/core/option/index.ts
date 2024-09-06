import { TracerOptions } from '../../types/TracerOptions';

class TraceOption {
  static instance: TraceOption;
  options!: TracerOptions;
  constructor(props?: TracerOptions) {
    if (TraceOption.instance) {
      return TraceOption.instance;
    }

    this.options = props || {};
    TraceOption.instance = this;
  }

  getOption() {
    return this.options;
  }

  setOption(options: TracerOptions) {
    this.options = options;
  }
}

export default new TraceOption();
