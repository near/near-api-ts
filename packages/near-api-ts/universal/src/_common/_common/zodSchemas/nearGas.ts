import * as z from 'zod/mini';
import { TeraGasDecimals } from '../_common/constants';

export const GasInputZodSchema = z.union([
  z.bigint(),
  z.pipe(
    z.number().check(z.int()),
    z.transform((v) => BigInt(v)),
  ),
]);

export const TeraGasInputZodSchema = z.string().check(
  z.refine(
    (val) => {
      const decimalPattern = new RegExp(`^\\d+(?:\\.\\d{1,${TeraGasDecimals}})?$`);
      return decimalPattern.test(val);
    },
    {
      message: `Must be a valid number with up to ${TeraGasDecimals} decimal places`,
    },
  ),
);

export const NearGasArgsZodSchema = z.union([
  z.object({ gas: GasInputZodSchema }),
  z.object({ teraGas: TeraGasInputZodSchema }),
]);
