import { describe, expect, it } from 'vitest';
import { convertDecimalToUnits } from '../../../src/_common/_common/unitConverter/convertDecimalToUnits';

describe('convertDecimalToUnits', () => {
  it.each([
    ['0', 1, 0n],
    ['0.0', 1, 0n],
    ['10', 1, 100n],
    ['10.1', 1, 101n],
    ['10.01', 2, 1001n],
    ['1.000', 3, 1000n],
    ['00012.3400', 4, 123400n],
    ['1.2', 5, 120000n],
    ['123456789', 2, 12345678900n],
    ['1', 24, 10n ** 24n],
    ['1', 25, 10n ** 25n],
    ['0.000123456789', 24, 123456789000000000000n],
  ])('converts %s with %i decimals', (decimal, decimals, expected) => {
    const v = convertDecimalToUnits(decimal, decimals);
    expect(v).toBe(expected);
  });

  it.each([
    ['-0', 1, 0n],
    ['-0.0', 1, 0n],
    ['-10', 1, -100n],
    ['-10.1', 1, -101n],
    ['-10.01', 2, -1001n],
    ['-1.000', 3, -1000n],
    ['-00012.3400', 4, -123400n],
    ['-1.2', 5, -120000n],
    ['-123456789', 2, -12345678900n],
    ['-1', 24, -(10n ** 24n)],
    ['-1', 25, -(10n ** 25n)],
    ['-0.000123456789', 24, -123456789000000000000n],
  ])('converts negative %s with %i decimals', (decimal, decimals, expected) => {
    const v = convertDecimalToUnits(decimal, decimals);
    expect(v).toBe(expected);
  });
});
