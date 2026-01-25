import * as z from 'zod/mini';
import { NearTokenArgsSchema } from '@common/schemas/zod/common/nearToken';
import { result } from '@common/utils/result';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { asThrowable } from '@common/utils/asThrowable';
import { createNatError } from '@common/natError';
import type {
  CreateStakeAction,
  SafeCreateStakeAction,
} from 'nat-types/actions/stake';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';

export const CreateStakeActionArgsSchema = z.object({
  amount: NearTokenArgsSchema,
  validatorPublicKey: PublicKeySchema,
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
