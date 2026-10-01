import * as z from 'zod/mini';
import type {
  CreateTopUpAccessKeyBalanceAction,
  SafeCreateTopUpAccessKeyBalanceAction,
} from '../../../types/_common/transaction/actions/delegableActions/topUpAccessKeyBalance';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { NearTokenArgsZodSchema } from '../../_common/_common/zodSchemas/nearToken';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';

export const CreateTopUpAccessKeyBalanceActionArgsSchema = z.object({
  publicKey: PublicKeyZodSchema,
  amount: NearTokenArgsZodSchema,
});

export const safeTopUpAccessKeyBalance: SafeCreateTopUpAccessKeyBalanceAction = wrapInternalError(
  'CreateAction.TopUpAccessKeyBalance.Internal',
  (args) => {
    const validArgs = CreateTopUpAccessKeyBalanceActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.TopUpAccessKeyBalance.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'TopUpAccessKeyBalance' as const,
      publicKey: args.publicKey,
      amount: args.amount,
    });
  },
);

export const topUpAccessKeyBalance: CreateTopUpAccessKeyBalanceAction =
  asThrowable(safeTopUpAccessKeyBalance);
