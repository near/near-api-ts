/**
 * Normalize a multiline string into a single-line message
 * by trimming and collapsing whitespace.
 */
export const oneLine = (msg: string): string => msg.replace(/\s+/g, ' ').trim();

export const isNodeJs =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const nodeInspectSymbol = isNodeJs ? Symbol.for('nodejs.util.inspect.custom') : undefined;

// TODO maybe we can take JsonValue instead of unknown
export const objectToU8 = (value: unknown): Uint8Array =>
  new TextEncoder().encode(JSON.stringify(value));

// TODO maybe we can return JsonValue instead of unknown
export const u8ToObject = (bytes: Uint8Array | number[]): unknown => {
  const u8 = Array.isArray(bytes) ? new Uint8Array(bytes) : bytes;
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(u8));
};

/**
 * Creates a single AbortSignal that merges multiple signals.
 * The output signal will be aborted as soon as any of the input signals is aborted.
 * The output signal reason will be taken from the first aborted input signal.
 */
export const combineAbortSignals = (signals: (AbortSignal | undefined)[]): AbortSignal =>
  AbortSignal.any(signals.filter((signal) => typeof signal !== 'undefined'));

/**
 * Generate a random value in range between min and max.
 */
export const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min;
