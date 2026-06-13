import { describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../src/_common/schemas/zod/common/accountId';

z.config(z.locales.en());

describe('AccountIdZodSchema', () => {
  it.each([
    'ab',
    'nat',
    'bob.near',
    'a-b.c_d.near',
    '12-1',
    'sub.account.testnet',
    'a'.repeat(64),
  ])('accepts a valid account id: %s', (accountId) => {
    expect(AccountIdZodSchema.safeParse(accountId).success).toBe(true);
  });

  it.each([
    ['a', 'shorter than 2 chars'],
    ['a'.repeat(65), 'longer than 64 chars'],
    ['Bob', 'uppercase letters'],
    ['nat.', 'trailing separator'],
    ['.nat', 'leading separator'],
    ['na..t', 'consecutive dot separators'],
    ['na--t', 'consecutive dash separators'],
    ['nat_', 'trailing underscore'],
    ['na me', 'whitespace'],
    ['ab!', 'illegal character'],
  ])('rejects an invalid account id (%s): "%s"', (accountId) => {
    expect(AccountIdZodSchema.safeParse(accountId).success).toBe(false);
  });
});
