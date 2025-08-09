import { pow10, assertValidDecimals } from './helpers';

/**
 * Validate a positive decimal string with an optional fractional part
 * whose length is limited by `decimals`:
 *
 * Pattern: ^\d+(?:\.\d{1,decimals})?$
 * - ^                  : anchor at start — match the whole string only
 * - \d+                : integer part — one or more digits (requires a digit before the dot)
 * - (?: ... )          : non-capturing group for the optional fractional part
 * - \.                 : literal dot
 * - \d{1,decimals}     : 1 to decimals digits after the dot
 * - ?                  : make the fractional group optional (allow integers)
 * - $                  : anchor at end — no extra chars allowed
 *
 * Notes:
 * - Disallows ".5" (no integer part) and "5." (no fractional digits).
 * - Disallows signs, spaces, commas, exponent notation, etc.
 * - Allows leading zeros in the integer part (e.g., "0001", "0.05").
 *
 * Examples (decimals = 2):
 *   ✓ "0", "12", "3.4", "10.00"
 *   ✗ ".5", "5.", "1.234", "-1", "1,23", "1e3", " 1"
 */
const assertValidTokens = (tokens: string, decimals: number) => {
  const decimalPattern = new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`);
  if (!decimalPattern.test(tokens)) {
    throw new Error(
      `Tokens must be a positive decimal with up to ${decimals} fractional digits`,
    );
  }
};

/**
 * Convert token amount (decimal string) to minimal units (integer string).
 *
 * Example: decimals = 24 (NEAR), "1.23" -> "1230000000000000000000000" (25 digits total, 24 after dot)
 *
 * @param tokens  Positive decimal string with up to `decimals` fractional digits
 * @param decimals      Fractional digits count (1..100)
 * @returns             Positive integer string in minimal units
 */
export const convertTokensToUnits = (
  tokens: string,
  decimals: number,
): string => {
  assertValidDecimals(decimals);
  assertValidTokens(tokens, decimals);

  // Split integer and fractional parts (fractional may be undefined)
  const [integerPartRaw, fractionalPartRaw = ''] = tokens.split('.');

  // Convert integer part: multiply by 10^decimals
  const scale = pow10(decimals);
  const integerUnits = BigInt(integerPartRaw) * scale;

  // Convert fractional part: right-pad to exactly `decimals` digits, or zero if empty
  const fractionalUnits = fractionalPartRaw.length
    ? BigInt(fractionalPartRaw.padEnd(decimals, '0'))
    : 0n;

  // Sum and return as an integer string (BigInt.toString() never yields leading zeros)
  return (integerUnits + fractionalUnits).toString();
};
