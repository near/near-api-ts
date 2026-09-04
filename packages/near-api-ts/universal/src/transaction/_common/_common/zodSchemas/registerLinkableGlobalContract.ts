import * as z from 'zod/mini';

export const RegisterLinkableGlobalContractActionZodSchema = z.object({
  actionType: z.literal('RegisterLinkableGlobalContract'),
  wasmU8: z.instanceof(Uint8Array),
});

export type InnerRegisterLinkableGlobalContractAction = z.infer<
  typeof RegisterLinkableGlobalContractActionZodSchema
>;
