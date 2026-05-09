import * as z from 'zod/mini';

export const GasInputZodSchema = z.union([
  z.bigint(),
  z.pipe(
    z.number().check(z.int()),
    z.transform((v) => BigInt(v)),
  ),
]);

const createTeraGasInputZodSchema = (decimals: number) =>
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

export const TeraGasInputZodSchema = createTeraGasInputZodSchema(12);

export const NearGasArgsZodSchema = z.union([
  z.object({
    gas: GasInputZodSchema,
  }),
  z.object({
    teraGas: TeraGasInputZodSchema,
  }),
]);
