import * as z from 'zod/mini';
import type { CreateDeleteAccountAction, SafeCreateDeleteAccountAction } from '../../../types/actions/deleteAccount';
import { createNatError } from '../../_common/natError';
import { AccountIdSchema } from '../../_common/schemas/zod/common/accountId';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

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
