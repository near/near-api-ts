import * as z from 'zod/mini';
import type {
  CreateLinkGlobalContractAction,
  SafeCreateLinkGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/linkGlobalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';

export const CreateLinkGlobalContractActionArgsSchema = z.object({
  globalContractAccountId: AccountIdZodSchema,
});

export const safeLinkGlobalContract: SafeCreateLinkGlobalContractAction = wrapInternalError(
  'CreateAction.LinkGlobalContract.Internal',
  (args) => {
    const validArgs = CreateLinkGlobalContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.LinkGlobalContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'LinkGlobalContract' as const,
      globalContractAccountId: validArgs.data.globalContractAccountId,
    });
  },
);

export const linkGlobalContract: CreateLinkGlobalContractAction =
  asThrowable(safeLinkGlobalContract);
