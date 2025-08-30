/**
 * Normalize a multiline string into a single-line message
 * by trimming and collapsing whitespace.
 */
export const oneLine = (msg: string): string =>
  msg.replace(/\s+/g, ' ').trim();
