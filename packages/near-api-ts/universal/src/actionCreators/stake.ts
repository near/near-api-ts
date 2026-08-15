import * as z from 'zod/mini';
import type {
  CreateStakeAction,
  SafeCreateStakeAction,
} from '../../types/_common/transaction/actions/nonDelegateActions/stake';
import { createNatError } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { NearTokenArgsZodSchema } from '../_common/_common/zodSchemas/nearToken';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';

export const CreateStakeActionArgsSchema = z.object({
  amount: NearTokenArgsZodSchema,
  validatorPublicKey: PublicKeyZodSchema,
});

export const safeStake: SafeCreateStakeAction = wrapInternalError(
  'CreateAction.Stake.Internal',
  (args) => {
    const validArgs = CreateStakeActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.Stake.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'Stake' as const,
      amount: args.amount,
      validatorPublicKey: args.validatorPublicKey,
    });
  },
);

export const throwableStake: CreateStakeAction = asThrowable(safeStake);
