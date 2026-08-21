import * as z from 'zod/mini';
import { NearGasArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearGas';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { ContractFunctionNameZodSchema } from '../../../../_common/zodSchemas/contractFunctionName';

export const FunctionCallActionZodSchema = z.object({
  actionType: z.literal('FunctionCall'),
  functionName: ContractFunctionNameZodSchema,
  functionArgs: z.instanceof(Uint8Array),
  gasLimit: NearGasArgsZodSchema,
  attachedDeposit: z.optional(NearTokenArgsZodSchema),
});

export type InnerFunctionCallAction = z.infer<typeof FunctionCallActionZodSchema>;
