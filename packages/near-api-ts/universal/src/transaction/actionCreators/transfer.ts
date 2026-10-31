import * as z from 'zod/mini';
import type {
  CreateTransferAction,
  SafeCreateTransferAction,
} from '../../../types/_common/transaction/actions/delegableActions/transfer';

import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { NearTokenArgsZodSchema } from '../../_common/_common/zodSchemas/nearToken';

export const CreateTransferActionArgsZodSchema = z.object({
  amount: NearTokenArgsZodSchema,
});

export const safeTransfer: SafeCreateTransferAction = wrapInternalError(
  'CreateAction.Transfer.Internal',
  (args) => {
    const validArgs = CreateTransferActionArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateAction.Transfer.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return result.ok({
      actionType: 'Transfer' as const,
      amount: args.amount,
    });
  },
);

export const transfer: CreateTransferAction = asThrowable(safeTransfer);
