import * as z from 'zod/mini';

export const RegisterGlobalContractActionZodSchema = z.object({
  actionType: z.literal('RegisterGlobalContract'),
  wasmU8: z.instanceof(Uint8Array),
  wasmMutability: z.union([z.literal('Mutable'), z.literal('Immutable')]),
});

export type InnerRegisterGlobalContractAction = z.infer<
  typeof RegisterGlobalContractActionZodSchema
>;
