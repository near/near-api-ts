import * as z from 'zod/mini';
import { ContractFunctionNameZodSchema } from '../../common/common';
import { NearGasArgsZodSchema } from '../../common/nearGas';
import { NearTokenArgsZodSchema } from '../../common/nearToken';

export const FunctionCallActionZodSchema = z.object({
  actionType: z.literal('FunctionCall'),
  functionName: ContractFunctionNameZodSchema,
  functionArgs: z.instanceof(Uint8Array),
  gasLimit: NearGasArgsZodSchema,
  attachedDeposit: z.optional(NearTokenArgsZodSchema),
});

export type InnerFunctionCallAction = z.infer<typeof FunctionCallActionZodSchema>;
