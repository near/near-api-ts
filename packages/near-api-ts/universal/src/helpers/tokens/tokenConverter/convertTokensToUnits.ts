import type { Tokens } from '@universal/types/_common/common';
import { pow10 } from './helpers';

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
  tokens: Tokens,
  decimals: number,
): bigint => {
  // Split integer and fractional parts (fractional may be undefined)
  const [integerPartRaw, fractionalPartRaw = ''] = tokens.split('.');
  const isNegative = integerPartRaw.startsWith('-');

  // Convert integer part: multiply by 10^decimals
  const scale = pow10(decimals);
  const integerUnits = BigInt(integerPartRaw) * scale;

  // Convert fractional part: right-pad to exactly `decimals` digits, or zero if empty
  const fractionalUnits =
    fractionalPartRaw.length > 0
      ? BigInt(fractionalPartRaw.padEnd(decimals, '0'))
      : 0n;

  // Sum and return as an integer string (BigInt.toString() never yields leading zeros)
  return isNegative
    ? integerUnits - fractionalUnits
    : integerUnits + fractionalUnits;
};
