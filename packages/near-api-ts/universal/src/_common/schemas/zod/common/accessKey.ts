import * as z from 'zod/mini';
import { ContractFunctionNameZodSchema } from './common';
import { NearTokenArgsZodSchema } from './nearToken';

export const GasBudgetZodSchema = z.union([z.literal('Unlimited'), NearTokenArgsZodSchema]);

export const AllowedFunctionsSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameZodSchema).check(z.minLength(1)),
]);
