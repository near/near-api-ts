import * as z from 'zod/mini';

export const PublishLinkableGlobalContractActionZodSchema = z.object({
  actionType: z.literal('PublishLinkableGlobalContract'),
  wasmU8: z.instanceof(Uint8Array),
});

export type InnerPublishLinkableGlobalContractAction = z.infer<
  typeof PublishLinkableGlobalContractActionZodSchema
>;
