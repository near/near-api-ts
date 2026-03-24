import * as z from 'zod/mini';
import { NearTokenArgsSchema } from './nearToken';
import { ContractFunctionNameSchema } from './common';

export const GasBudgetSchema = z.union([z.literal('Unlimited'), NearTokenArgsSchema]);

export const AllowedFunctionsSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameSchema).check(z.minLength(1)),
]);
