import * as z from 'zod/mini';
import type {
  CreateTransferAction,
  SafeCreateTransferAction,
} from '../../../types/_common/transaction/actions/delegableActions/transfer';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { NearTokenArgsZodSchema } from '../../_common/_common/zodSchemas/nearToken';

export const CreateTransferActionArgsSchema = z.object({
  amount: NearTokenArgsZodSchema,
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

export const throwableTransfer: CreateTransferAction = asThrowable(safeTransfer);
