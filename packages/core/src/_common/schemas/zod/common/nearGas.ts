import * as z from 'zod/mini';

export const GasInputSchema = z.union([
  z.bigint(),
  z.pipe(
    z.number().check(z.int()),
    z.transform((v) => BigInt(v)),
  ),
]);

const createTeraGasInputSchema = (decimals: number) =>
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

export const TeraGasInputSchema = createTeraGasInputSchema(12);

export const NearGasArgsSchema = z.union([
  z.object({
    gas: GasInputSchema,
  }),
  z.object({
    teraGas: TeraGasInputSchema,
  }),
]);
