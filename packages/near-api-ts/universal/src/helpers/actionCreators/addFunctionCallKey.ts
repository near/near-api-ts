import * as z from 'zod/mini';
import type {
  CreateAddFunctionCallKeyAction,
  SafeCreateAddFunctionCallKeyAction,
} from '../../../types/_common/transaction/actions/addKey';
import { createNatError } from '../../_common/natError';
import {
  AllowedFunctionsSchema,
  GasBudgetSchema,
} from '../../_common/schemas/zod/common/accessKey';
import { AccountIdSchema } from '../../_common/schemas/zod/common/accountId';
import { PublicKeySchema } from '../../_common/schemas/zod/common/publicKey';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

export const CreateAddFunctionCallKeyActionArgsSchema = z.object({
  publicKey: PublicKeySchema,
  contractAccountId: AccountIdSchema,
  gasBudget: GasBudgetSchema,
  allowedFunctions: AllowedFunctionsSchema,
});

export const safeAddFunctionCallKey: SafeCreateAddFunctionCallKeyAction = wrapInternalError(
  'CreateAction.AddFunctionCallKey.Internal',
  (args) => {
    const validArgs = CreateAddFunctionCallKeyActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.AddFunctionCallKey.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'AddKey' as const,
      accessType: 'FunctionCall' as const,
      publicKey: args.publicKey,
      contractAccountId: args.contractAccountId,
      gasBudget: args.gasBudget,
      allowedFunctions: args.allowedFunctions,
    });
  },
);

export const throwableAddFunctionCallKey: CreateAddFunctionCallKeyAction =
  asThrowable(safeAddFunctionCallKey);
