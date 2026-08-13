/**
 * Creates a single AbortSignal that merges multiple signals.
 * The output signal will be aborted as soon as any of the input signals is aborted.
 * The output signal reason will be taken from the first aborted input signal.
 */
export const combineAbortSignals = (signals: (AbortSignal | undefined)[]): AbortSignal =>
  AbortSignal.any(signals.filter((signal) => typeof signal !== 'undefined'));
