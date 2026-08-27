import * as z from 'zod/mini';

export const DeployContractActionZodSchema = z.object({
  actionType: z.literal('DeployContract'),
  wasmU8: z.instanceof(Uint8Array),
});

export type InnerDeployContractAction = z.infer<typeof DeployContractActionZodSchema>;
