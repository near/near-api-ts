import * as z from 'zod/mini';
import type { CreateStakeAction, SafeCreateStakeAction } from '../../../types/actions/stake';
import { createNatError } from '../../_common/natError';
import { NearTokenArgsSchema } from '../../_common/schemas/zod/common/nearToken';
import { PublicKeySchema } from '../../_common/schemas/zod/common/publicKey';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

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
