import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../common/nearToken';
import { PublicKeyZodSchema } from '../../common/publicKey';

export const StakeActionZodSchema = z.object({
  actionType: z.literal('Stake'),
  amount: NearTokenArgsZodSchema,
  validatorPublicKey: PublicKeyZodSchema,
});

export type InnerStakeAction = z.infer<typeof StakeActionZodSchema>;
