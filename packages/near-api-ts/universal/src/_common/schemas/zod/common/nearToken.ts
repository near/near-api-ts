import * as z from 'zod/mini';

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
 *   ✗ ".5", "5.", "1.234", "-1", "1e3", " 1"
 */
const createTokensInputSchema = (decimals: number) =>
  z.string().check(
    z.refine(
      (val) => {
        const decimalPattern = new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`);
        return decimalPattern.test(val);
      },
      {
        message: `Must be a valid number with up to ${decimals} decimal places`,
      },
    ),
  );

export const NearInputSchema = createTokensInputSchema(24);

const BigintStringSchema = z.pipe(
  z.string().check(z.regex(/^\d+$/, 'Must contain only digits')),
  z.transform((v) => BigInt(v)),
);

export const YoctoNearInputSchema = z.union([z.bigint(), BigintStringSchema]);

export const NearTokenArgsSchema = z.union([
  z.object({
    near: NearInputSchema,
  }),
  z.object({
    yoctoNear: YoctoNearInputSchema,
  }),
]);
