import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';

export const StakeActionZodSchema = z.object({
  actionType: z.literal('Stake'),
  amount: NearTokenArgsZodSchema,
  validatorPublicKey: PublicKeyZodSchema,
});

export type InnerStakeAction = z.infer<typeof StakeActionZodSchema>;
