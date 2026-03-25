import * as z from 'zod/mini';
import { ContractFunctionNameSchema } from './common';
import { NearTokenArgsSchema } from './nearToken';

export const GasBudgetSchema = z.union([z.literal('Unlimited'), NearTokenArgsSchema]);

export const AllowedFunctionsSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameSchema).check(z.minLength(1)),
]);
