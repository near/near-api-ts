import * as z from 'zod/mini';
import { ContractFunctionNameZodSchema } from '../_common/zodSchemas/contractFunctionName';
import { NearTokenArgsZodSchema } from '../_common/zodSchemas/nearToken';

export const GasBudgetZodSchema = z.union([z.literal('Unlimited'), NearTokenArgsZodSchema]);

export const AllowedFunctionsSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameZodSchema).check(z.minLength(1)),
]);
