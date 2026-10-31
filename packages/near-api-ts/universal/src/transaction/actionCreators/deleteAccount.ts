import * as z from 'zod/mini';
import type {
  CreateDeleteAccountAction,
  SafeCreateDeleteAccountAction,
} from '../../../types/_common/transaction/actions/delegableActions/deleteAccount';

import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';

export const CreateDeleteAccountActionArgsSchema = z.object({
  beneficiaryAccountId: AccountIdZodSchema,
});

export const safeDeleteAccount: SafeCreateDeleteAccountAction = wrapInternalError(
  'CreateAction.DeleteAccount.Internal',
  (args) => {
    const validArgs = CreateDeleteAccountActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateAction.DeleteAccount.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return result.ok({
      actionType: 'DeleteAccount' as const,
      beneficiaryAccountId: args.beneficiaryAccountId,
    });
  },
);

export const deleteAccount: CreateDeleteAccountAction = asThrowable(safeDeleteAccount);
