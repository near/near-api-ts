import * as z from 'zod/mini';

export const RegisterPinnableGlobalContractActionZodSchema = z.object({
  actionType: z.literal('RegisterPinnableGlobalContract'),
  wasmU8: z.instanceof(Uint8Array),
});

export type InnerRegisterPinnableGlobalContractAction = z.infer<
  typeof RegisterPinnableGlobalContractActionZodSchema
>;
