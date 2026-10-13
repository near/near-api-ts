import * as z from 'zod/mini';

export const PublishPinnableGlobalContractActionZodSchema = z.object({
  actionType: z.literal('PublishPinnableGlobalContract'),
  wasmU8: z.instanceof(Uint8Array),
});

export type InnerPublishPinnableGlobalContractAction = z.infer<
  typeof PublishPinnableGlobalContractActionZodSchema
>;
