import * as z from 'zod/mini';

export const DeployContractActionSchema = z.object({
  actionType: z.literal('DeployContract'),
  wasmBytes: z.instanceof(Uint8Array),
});

export type InnerDeployContractAction = z.infer<
  typeof DeployContractActionSchema
>;
