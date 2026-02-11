/**
 * Fixed-point conversions without third-party libs.
 * Assumptions:
 * - `decimals` is the number of fractional digits (1..100).
 * - Inputs are positive, plain-decimal strings (no sign, no exponent, no separators).
 * - All math uses BigInt; strings are only for parsing/formatting.
 */

/** Cache for powers of 10 to avoid recomputing 10^decimals repeatedly. */
const POW10_CACHE: Record<number, bigint> = {};

/** Returns 10^decimals as BigInt, caching the result. */
export const pow10 = (decimals: number): bigint => {
  const cached = POW10_CACHE[decimals];
  if (cached !== undefined) return cached;
  const value = 10n ** BigInt(decimals);
  POW10_CACHE[decimals] = value;
  return value;
};
