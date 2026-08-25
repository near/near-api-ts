import * as z from 'zod/mini';
import { SignedDelegationZodSchema } from '../../../_common/zodSchemas/delegation';

export const ExecuteDelegationActionZodSchema = z.object({
  actionType: z.literal('ExecuteDelegation'),
  signedDelegation: SignedDelegationZodSchema,
});

export type InnerExecuteDelegationAction = z.infer<typeof ExecuteDelegationActionZodSchema>;
