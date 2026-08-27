import * as z from 'zod/mini';

export const RegisterGlobalContractActionZodSchema = z.object({
  actionType: z.literal('RegisterGlobalContract'),
  wasmBytes: z.instanceof(Uint8Array),
  referenceBy: z.union([z.literal('WasmHash'), z.literal('OwnerAccountId')]),
});

export type InnerRegisterGlobalContractAction = z.infer<
  typeof RegisterGlobalContractActionZodSchema
>;
