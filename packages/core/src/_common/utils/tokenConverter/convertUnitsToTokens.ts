import { pow10, assertValidDecimals } from './helpers';

// Validate units input: must be positive integer digits only
const assertValidUnits = (units: bigint | string) => {
  if (typeof units === 'string' && !/^\d+$/.test(units)) {
    throw new Error('Units must be a positive integer string (digits only)');
  }
};

/**
 * Convert minimal units (integer string) to token amount (decimal string).
 *
 * Example: decimals = 24 (NEAR), "1000000...000" (24 zeros) -> "1"
 *
 * @param units  Positive integer string in minimal units ("yocto", "wei", etc.)
 * @param decimals     Fractional digits count (1..100)
 * @returns            Decimal string with up to `decimals` digits after the dot
 */
export const convertUnitsToTokens = (
  units: bigint | string,
  decimals: number,
): string => {
  assertValidDecimals(decimals);
  assertValidUnits(units);

  // Numeric conversion
  const unitsBigInt = BigInt(units);
  const scale = pow10(decimals);

  // Integer division gives the whole part; remainder gives the fractional digits
  const wholePart = unitsBigInt / scale;
  const fractionalRemainder = unitsBigInt % scale;

  // If there is no fractional remainder, return the whole part as a plain integer
  if (fractionalRemainder === 0n) return wholePart.toString();

  // Build the fractional part from the division remainder.
  //
  // Why:
  // - `fractionalRemainder` is in [0, 10^decimals - 1]. Converting it to string
  //   drops any leading zeros (e.g., 42n -> "42"), but those zeros are needed to
  //   preserve the decimal shift (we want ".0000042" when decimals=7).
  //
  // Steps:
  // 1) .toString()         — turn the remainder into a plain digit string.
  // 2) .padStart(decimals, 0) — left-pad with zeros so it has exactly `decimals` digits;
  //                          this restores any lost leading zeros.
  // 3) .replace(/0+$/, '') — trim trailing zeros on the RIGHT to avoid redundant
  //                          fractional digits (emit "1.23", not "1.230000").
  //
  // Notes:
  // - If everything after padding is zeros, trimming produces an empty string,
  //   and the caller typically returns only the whole part (e.g., "1" instead of "1.").
  //
  // Examples:
  // - units=1001,   decimals=3 → remainder=1
  //   "1" → padStart -> "001" → trim trailing zeros -> "001" (no change) → result "1.001"
  //
  // - units=1230000, decimals=6 → remainder=230000
  //   "230000" → padStart -> "230000" → trim trailing zeros -> "23" → result "1.23"
  const fractionalDigits = fractionalRemainder
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '');

  // If trimming removed everything (edge case), fall back to just the whole part
  if (fractionalDigits.length === 0) return wholePart.toString();

  return `${wholePart.toString()}.${fractionalDigits}`;
};
