import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../../../../../_common/_common/zodSchemas/nearToken';
import { ContractFunctionNameZodSchema } from '../../../../../../_common/zodSchemas/contractFunctionName';

export const GasBudgetZodSchema = z.union([z.literal('Unlimited'), NearTokenArgsZodSchema]);

export const AllowedFunctionsSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameZodSchema).check(z.minLength(1)),
]);
