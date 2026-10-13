import * as z from 'zod/mini';

export const DeployLocalContractActionZodSchema = z.object({
  actionType: z.literal('DeployLocalContract'),
  wasmU8: z.instanceof(Uint8Array),
});

export type InnerDeployLocalContractAction = z.infer<typeof DeployLocalContractActionZodSchema>;
