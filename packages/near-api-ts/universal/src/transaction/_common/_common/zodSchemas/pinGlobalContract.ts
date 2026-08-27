import * as z from 'zod/mini';
import { CryptoHashZodSchema } from '../../../../_common/zodSchemas/cryptoHash';

export const PinGlobalContractActionZodSchema = z.object({
  actionType: z.literal('PinGlobalContract'),
  globalContractWasmHash: CryptoHashZodSchema,
});

export type InnerPinGlobalContractAction = z.infer<typeof PinGlobalContractActionZodSchema>;
