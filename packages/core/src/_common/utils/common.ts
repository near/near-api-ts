/**
 * Normalize a multiline string into a single-line message
 * by trimming and collapsing whitespace.
 */
export const oneLine = (msg: string): string => msg.replace(/\s+/g, ' ').trim();

export const isNodeJs =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const nodeInspectSymbol: symbol | undefined = isNodeJs
  ? Symbol.for('nodejs.util.inspect.custom')
  : undefined;
