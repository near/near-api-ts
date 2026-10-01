import * as z from 'zod/mini';
import type {
  CreateWithdrawAccessKeyBalanceAction,
  SafeCreateWithdrawAccessKeyBalanceAction,
} from '../../../types/_common/transaction/actions/delegableActions/withdrawAccessKeyBalance';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { NearTokenArgsZodSchema } from '../../_common/_common/zodSchemas/nearToken';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';

export const CreateWithdrawAccessKeyBalanceActionArgsSchema = z.object({
  publicKey: PublicKeyZodSchema,
  amount: NearTokenArgsZodSchema,
});

export const safeWithdrawAccessKeyBalance: SafeCreateWithdrawAccessKeyBalanceAction =
  wrapInternalError('CreateAction.WithdrawAccessKeyBalance.Internal', (args) => {
    const validArgs = CreateWithdrawAccessKeyBalanceActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.WithdrawAccessKeyBalance.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'WithdrawAccessKeyBalance' as const,
      publicKey: args.publicKey,
      amount: args.amount,
    });
  });

export const withdrawAccessKeyBalance: CreateWithdrawAccessKeyBalanceAction = asThrowable(
  safeWithdrawAccessKeyBalance,
);
