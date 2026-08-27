import * as z from 'zod/mini';
import type {
  CreateAddFunctionCallKeyAction,
  SafeCreateAddFunctionCallKeyAction,
} from '../../../types/_common/transaction/actions/delegableActions/addKey';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { AllowedFunctionsSchema, GasBudgetZodSchema } from '../_common/_common/zodSchemas/addKey';

export const CreateAddFunctionCallKeyActionArgsSchema = z.object({
  publicKey: PublicKeyZodSchema,
  contractAccountId: AccountIdZodSchema,
  gasBudget: GasBudgetZodSchema,
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
