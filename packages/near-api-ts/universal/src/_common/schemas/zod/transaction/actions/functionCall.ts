import * as z from 'zod/mini';
import { NearTokenArgsSchema } from '../../common/nearToken';
import { NearGasArgsSchema } from '../../common/nearGas';
import { ContractFunctionNameSchema } from '../../common/common';

export const FunctionCallActionSchema = z.object({
  actionType: z.literal('FunctionCall'),
  functionName: ContractFunctionNameSchema,
  functionArgs: z.instanceof(Uint8Array),
  gasLimit: NearGasArgsSchema,
  attachedDeposit: z.optional(NearTokenArgsSchema),
});

export type InnerFunctionCallAction = z.infer<typeof FunctionCallActionSchema>;
