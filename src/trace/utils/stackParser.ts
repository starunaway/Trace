import { StackLineParser, StackParser, StackFrame, StackLineParserFn } from '../types/stacktrace';

const STACKTRACE_FRAME_LIMIT = 50;
export const UNKNOWN_FUNCTION = '?';

function createStackParser(...parsers: StackLineParser[]): StackParser {
  const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);

  return (stack: string, skipFirstLines: number = 0, framesToPop: number = 0): StackFrame[] => {
    const frames: StackFrame[] = [];
    const lines = stack.split('\n');

    for (let i = skipFirstLines; i < lines.length; i++) {
      const line = lines[i] as string;
      // Ignore lines over 1kb as they are unlikely to be stack frames.
      // Many of the regular expressions use backtracking which results in run time that increases exponentially with
      // input size. Huge strings can result in hangs/Denial of Service:
      // https://github.com/getsentry/sentry-javascript/issues/2286
      if (line.length > 1024) {
        continue;
      }

      // https://github.com/getsentry/sentry-javascript/issues/5459
      // Remove webpack (error: *) wrappers
      const cleanedLine = line;

      // https://github.com/getsentry/sentry-javascript/issues/7813
      // Skip Error: lines
      if (cleanedLine.match(/\S*Error: /)) {
        continue;
      }

      for (const parser of sortedParsers) {
        const frame = parser(cleanedLine);

        if (frame) {
          frames.push(frame);
          break;
        }
      }

      if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) {
        break;
      }
    }

    return stripSentryFramesAndReverse(frames.slice(framesToPop));
  };
}

export function stripSentryFramesAndReverse(stack: ReadonlyArray<StackFrame>): StackFrame[] {
  if (!stack.length) {
    return [];
  }

  const localStack = Array.from(stack);

  // Reversing in the middle of the procedure allows us to just pop the values off the stack
  localStack.reverse();

  return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => ({
    ...frame,
    filename: frame.filename || getLastStackFrame(localStack).filename,
    function: frame.function || UNKNOWN_FUNCTION,
  }));
}

function getLastStackFrame(arr: StackFrame[]): StackFrame {
  return arr[arr.length - 1] || {};
}
const CHROME_PRIORITY = 30;
const GECKO_PRIORITY = 50;

function createFrame(filename: string, func: string, lineno?: number, colno?: number): StackFrame {
  const frame: StackFrame = {
    filename,
    function: func === '<anonymous>' ? UNKNOWN_FUNCTION : func,
    in_app: true, // All browser frames are considered in_app
  };

  if (lineno !== undefined) {
    frame.lineno = lineno;
  }

  if (colno !== undefined) {
    frame.colno = colno;
  }

  return frame;
}

// This regex matches frames that have no function name (ie. are at the top level of a module).
// For example "at http://localhost:5000//script.js:1:126"
// Frames _with_ function names usually look as follows: "at commitLayoutEffects (react-dom.development.js:23426:1)"
const chromeRegexNoFnName = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;

// This regex matches all the frames that have a function name.
const chromeRegex =
  /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;

// Chromium based browsers: Chrome, Brave, new Opera, new Edge
// We cannot call this variable `chrome` because it can conflict with global `chrome` variable in certain environments
// See: https://github.com/getsentry/sentry-javascript/issues/6880
const chromeStackParserFn: StackLineParserFn = (line) => {
  // If the stack line has no function name, we need to parse it differently
  const noFnParts = chromeRegexNoFnName.exec(line) as null | [string, string, string, string];

  if (noFnParts) {
    const [, filename, line, col] = noFnParts;
    return createFrame(filename, UNKNOWN_FUNCTION, +line, +col);
  }

  const parts = chromeRegex.exec(line) as null | [string, string, string, string, string];

  if (parts) {
    const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line

    if (isEval) {
      const subMatch = chromeEvalRegex.exec(parts[2]) as null | [string, string, string, string];

      if (subMatch) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = subMatch[1]; // url
        parts[3] = subMatch[2]; // line
        parts[4] = subMatch[3]; // column
      }
    }

    // Kamil: One more hack won't hurt us right? Understanding and adding more rules on top of these regexps right now
    // would be way too time consuming. (TODO: Rewrite whole RegExp to be more readable)
    const [func, filename] = extractSafariExtensionDetails(parts[1] || UNKNOWN_FUNCTION, parts[2]);

    return createFrame(
      filename,
      func,
      parts[3] ? +parts[3] : undefined,
      parts[4] ? +parts[4] : undefined
    );
  }

  return;
};

export const chromeStackLineParser: StackLineParser = [CHROME_PRIORITY, chromeStackParserFn];

// gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
// generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
// We need this specific case for now because we want no other regex to match.
const geckoREgex =
  /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
const geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;

const gecko: StackLineParserFn = (line) => {
  const parts = geckoREgex.exec(line) as null | [string, string, string, string, string, string];

  if (parts) {
    const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
    if (isEval) {
      const subMatch = geckoEvalRegex.exec(parts[3]) as null | [string, string, string];

      if (subMatch) {
        // throw out eval line/column and use top-most line number
        parts[1] = parts[1] || 'eval';
        parts[3] = subMatch[1];
        parts[4] = subMatch[2];
        parts[5] = ''; // no column when eval
      }
    }

    let filename = parts[3];
    let func = parts[1] || UNKNOWN_FUNCTION;
    [func, filename] = extractSafariExtensionDetails(func, filename);

    return createFrame(
      filename,
      func,
      parts[4] ? +parts[4] : undefined,
      parts[5] ? +parts[5] : undefined
    );
  }

  return;
};

export const geckoStackLineParser: StackLineParser = [GECKO_PRIORITY, gecko];

export const defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser];

export const stackParser = createStackParser(...defaultStackLineParsers);

const extractSafariExtensionDetails = (func: string, filename: string): [string, string] => {
  const isSafariExtension = func.indexOf('safari-extension') !== -1;
  const isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;

  return isSafariExtension || isSafariWebExtension
    ? [
        func.indexOf('@') !== -1 ? (func.split('@')[0] as string) : UNKNOWN_FUNCTION,
        isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`,
      ]
    : [func, filename];
};
