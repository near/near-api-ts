import * as z from 'zod/mini';
import type {
  SafeCreateDeleteAccountAction,
  CreateDeleteAccountAction,
} from 'nat-types/actions/deleteAccount';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { asThrowable } from '@common/utils/asThrowable';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';

export const CreateDeleteAccountActionArgsSchema = z.object({
  beneficiaryAccountId: AccountIdSchema,
});

export const safeDeleteAccount: SafeCreateDeleteAccountAction =
  wrapInternalError('CreateAction.DeleteAccount.Internal', (args) => {
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
  });

export const throwableDeleteAccount: CreateDeleteAccountAction =
  asThrowable(safeDeleteAccount);
