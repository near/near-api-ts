import { describe, expect, it } from 'vitest';
import { convertUnitsToTokens } from '../../../src/helpers/tokens/tokenConverter/convertUnitsToTokens';

describe('Convert Units To Tokens', () => {
  it.each([
    // Zero
    [0n, 1, '0'],
    [0n, 24, '0'],

    // Pure integers (remainder = 0) -> no ".0"
    [100n, 1, '10'],
    [1000n, 3, '1'],
    [10n ** 24n, 24, '1'],
    [10n ** 25n, 25, '1'],

    // Fractions with a normal remainder
    [101n, 1, '10.1'],
    [1001n, 3, '1.001'],
    [1001n, 2, '10.01'],

    // Leading zeros in the fractional part (padStart)
    [1n, 3, '0.001'],
    [42n, 7, '0.0000042'],
    [123n, 5, '0.00123'],

    // Trimming trailing zeros in fractional part (replace(/0+$/, ''))
    [120000n, 5, '1.2'],
    [1230000n, 6, '1.23'],
    [10001000n, 6, '10.001'],

    // Larger numbers
    [12345678900n, 2, '123456789'],
    [12345678901n, 2, '123456789.01'],
    [123456789000000000000n, 24, '0.000123456789'],
  ])('converts %s units with %i decimals', (units, decimals, expected) => {
    const v = convertUnitsToTokens(units, decimals);
    expect(v).toBe(expected);
  });

  it.each([
    // Negative zero variants should still format as "0"
    [-0n, 1, '0'],
    [-0n, 24, '0'],

    // Pure integers (remainder = 0)
    [-100n, 1, '-10'],
    [-1000n, 3, '-1'],
    [-(10n ** 24n), 24, '-1'],
    [-(10n ** 25n), 25, '-1'],

    // Fractions
    [-101n, 1, '-10.1'],
    [-1001n, 3, '-1.001'],
    [-1001n, 2, '-10.01'],

    // Negative fractions with leading zeros
    [-1n, 3, '-0.001'],
    [-42n, 7, '-0.0000042'],
    [-123n, 5, '-0.00123'],

    // Trimming trailing zeros
    [-120000n, 5, '-1.2'],
    [-1230000n, 6, '-1.23'],
    [-10001000n, 6, '-10.001'],

    // Larger numbers
    [-12345678900n, 2, '-123456789'],
    [-12345678901n, 2, '-123456789.01'],
    [-123456789000000000000n, 24, '-0.000123456789'],
  ])('converts negative %s units with %i decimals', (units, decimals, expected) => {
    const v = convertUnitsToTokens(units, decimals);
    expect(v).toBe(expected);
  });
});
