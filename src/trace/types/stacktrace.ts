export interface StackFrame {
  filename?: string;
  function?: string;
  module?: string;
  platform?: string;
  lineno?: number;
  colno?: number;
  abs_path?: string;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
  in_app?: boolean;
  instruction_addr?: string;
  addr_mode?: string;
  vars?: { [key: string]: any };
  debug_id?: string;
  module_metadata?: any;
}

/** JSDoc */
export interface Stacktrace {
  frames?: StackFrame[];
  frames_omitted?: [number, number];
}

export type StackParser = (
  stack: string,
  skipFirstLines?: number,
  framesToPop?: number
) => StackFrame[];
export type StackLineParserFn = (line: string) => StackFrame | undefined;
export type StackLineParser = [number, StackLineParserFn];
