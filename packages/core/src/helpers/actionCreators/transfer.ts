import * as z from 'zod/mini';
import type {
  CreateTransferAction,
  SafeCreateTransferAction,
} from 'nat-types/actions/transfer';
import { NearTokenArgsSchema } from '@common/schemas/zod/common/nearToken';
import { result } from '@common/utils/result';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { asThrowable } from '@common/utils/asThrowable';
import { createNatError } from '@common/natError';

export const CreateTransferActionArgsSchema = z.object({
  amount: NearTokenArgsSchema,
});

export const safeTransfer: SafeCreateTransferAction = wrapInternalError(
  'CreateAction.Transfer.Internal',
  (args) => {
    const validArgs = CreateTransferActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.Transfer.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'Transfer' as const,
      amount: args.amount,
    });
  },
);

export const throwableTransfer: CreateTransferAction =
  asThrowable(safeTransfer);
