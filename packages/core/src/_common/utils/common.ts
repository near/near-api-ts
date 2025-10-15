/**
 * Normalize a multiline string into a single-line message
 * by trimming and collapsing whitespace.
 */
export const oneLine = (msg: string): string => msg.replace(/\s+/g, ' ').trim();

export const isNodeJs =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const nodeInspectSymbol = isNodeJs
  ? Symbol.for('nodejs.util.inspect.custom')
  : undefined;

export const toJsonBytes = (value: unknown): Uint8Array =>
  new TextEncoder().encode(JSON.stringify(value));

export const fromJsonBytes = (bytes: Uint8Array | number[]): unknown => {
  const u8 = Array.isArray(bytes) ? new Uint8Array(bytes) : bytes;
  return JSON.parse(new TextDecoder().decode(u8));
};

export const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) reject(new Error('abort signal'));
    const timeoutId = setTimeout(resolve, ms);

    if (signal)
      signal.onabort = () => {
        clearTimeout(timeoutId);
        reject(new Error('abort signal'));
      };
  });
