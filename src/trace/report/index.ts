import Tracer from '../core';
import { TraceEventType } from '../types/Event';
import { ReportOptions } from '../types/ReportOptions';

class TraceReport {
  id: string;
  tracer: Tracer;
  constructor({ id }: ReportOptions) {
    this.id = id;
    this.tracer = new Tracer({});
    this.start();
  }

  private start() {
    this.tracer.on(TraceEventType.Error, (data) => {
      console.log(data);
    });
  }

  public report() {
    // TODO: report
  }
}

export default TraceReport;
