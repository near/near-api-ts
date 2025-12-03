import * as z from 'zod/mini';

export const DeployContractActionSchema = z.union([
  z.object({
    actionType: z.literal('DeployContract'),
    wasmBase64: z.base64(),
  }),
  z.object({
    actionType: z.literal('DeployContract'),
    wasmBytes: z.instanceof(Uint8Array),
  }),
]);

export type InnerDeployContractAction = z.infer<typeof DeployContractActionSchema>
