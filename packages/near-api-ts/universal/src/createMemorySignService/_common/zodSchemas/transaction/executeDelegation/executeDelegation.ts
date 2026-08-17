import * as z from 'zod/mini';
import { SignedDelegationZodSchema } from './delegation';

export const ExecuteDelegationActionZodSchema = z.object({
  actionType: z.literal('ExecuteDelegation'),
  ...SignedDelegationZodSchema.shape,
});

export type InnerExecuteDelegationAction = z.infer<typeof ExecuteDelegationActionZodSchema>;
