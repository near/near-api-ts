import * as z from 'zod/mini';
import { NearGasArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearGas';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { ContractFunctionNameZodSchema } from '../../../../_common/zodSchemas/contractFunctionName';

export const CallContractFunctionActionZodSchema = z.object({
  actionType: z.literal('CallContractFunction'),
  functionName: ContractFunctionNameZodSchema,
  functionArgs: z.instanceof(Uint8Array),
  gasLimit: NearGasArgsZodSchema,
  attachedDeposit: z.optional(NearTokenArgsZodSchema),
});

export type InnerCallContractFunctionAction = z.infer<typeof CallContractFunctionActionZodSchema>;
