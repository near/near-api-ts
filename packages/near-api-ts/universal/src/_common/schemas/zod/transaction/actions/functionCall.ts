import * as z from 'zod/mini';
import { ContractFunctionNameSchema } from '../../common/common';
import { NearGasArgsSchema } from '../../common/nearGas';
import { NearTokenArgsSchema } from '../../common/nearToken';

export const FunctionCallActionSchema = z.object({
  actionType: z.literal('FunctionCall'),
  functionName: ContractFunctionNameSchema,
  functionArgs: z.instanceof(Uint8Array),
  gasLimit: NearGasArgsSchema,
  attachedDeposit: z.optional(NearTokenArgsSchema),
});

export type InnerFunctionCallAction = z.infer<typeof FunctionCallActionSchema>;
