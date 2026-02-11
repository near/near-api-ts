import * as z from 'zod/mini';
import { NearTokenArgsSchema } from '../../common/nearToken';
import { PublicKeySchema } from '../../common/publicKey';

export const StakeActionSchema = z.object({
  actionType: z.literal('Stake'),
  amount: NearTokenArgsSchema,
  validatorPublicKey: PublicKeySchema,
});

export type InnerStakeAction = z.infer<typeof StakeActionSchema>;
