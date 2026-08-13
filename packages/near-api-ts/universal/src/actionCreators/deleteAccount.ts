import * as z from 'zod/mini';
import type {
  CreateDeleteAccountAction,
  SafeCreateDeleteAccountAction,
} from '../../types/_common/transaction/actions/nonDelegateActions/deleteAccount';
import { createNatError } from '../_common/_common/_common/natError';
import { asThrowable } from '../_common/_common/asThrowable';
import { result } from '../_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../_common/zodSchemas/accountId';

export const CreateDeleteAccountActionArgsSchema = z.object({
  beneficiaryAccountId: AccountIdZodSchema,
});

export const safeDeleteAccount: SafeCreateDeleteAccountAction = wrapInternalError(
  'CreateAction.DeleteAccount.Internal',
  (args) => {
    const validArgs = CreateDeleteAccountActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.DeleteAccount.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'DeleteAccount' as const,
      beneficiaryAccountId: args.beneficiaryAccountId,
    });
  },
);

export const throwableDeleteAccount: CreateDeleteAccountAction = asThrowable(safeDeleteAccount);
