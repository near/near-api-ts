import * as z from 'zod/mini';
import type { CreateSafeSignDelegation } from '../../types/signer/public/createSignDelegation';
import { isNatErrorOf } from '../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { repackError } from '../_common/repackError';
import { AccountIdZodSchema } from '../_common/zodSchemas/accountId';
import { BlockHeightZodSchema } from '../_common/zodSchemas/blockHeight';
import {
  MultiDelegatedActionsZodSchema,
  SingleDelegatedActionZodSchema,
} from '../transaction/_common/delegationZodSchema';

// A delegation without its delegator - the signer fills it in with the key it signs by
const DelegationIntentZodSchema = z.union([
  z.object({
    receiverAccountId: AccountIdZodSchema,
    expiration: z.object({ blockHeight: BlockHeightZodSchema }),
    ...SingleDelegatedActionZodSchema.shape,
  }),
  z.object({
    receiverAccountId: AccountIdZodSchema,
    expiration: z.object({ blockHeight: BlockHeightZodSchema }),
    ...MultiDelegatedActionsZodSchema.shape,
  }),
]);

const SignDelegationArgsZodSchema = z.object({
  intent: DelegationIntentZodSchema,
});

export const createSafeSignDelegation: CreateSafeSignDelegation = (context) =>
  wrapInternalError('Signer.SignDelegation.Internal', async (args) => {
    const validArgs = SignDelegationArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('Signer.SignDelegation.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const signedDelegation = await context.taskQueue.addSignDelegationTask(args.intent);

    if (signedDelegation.success) return signedDelegation;

    // Repack some errors to make them method-specific
    if (
      isNatErrorOf(signedDelegation.error, [
        'Signer.KeyPool.AccessKeys.NotLoaded',
        'Signer.KeyPool.Empty',
        'Signer.KeyPool.SignService.Failed',
        'Signer.KeyPool.SigningKey.NotFound',
        'Signer.TaskQueue.Timeout',
      ])
    )
      return repackError({
        error: signedDelegation.error,
        originPrefix: 'Signer',
        targetPrefix: 'Signer.SignDelegation',
      });

    return result.err(signedDelegation.error);
  });
