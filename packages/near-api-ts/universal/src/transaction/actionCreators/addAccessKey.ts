import type {
  CreateAddAccessKeyAction,
  SafeCreateAddAccessKeyAction,
} from '../../../types/_common/transaction/actions/delegableActions/addAccessKey';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { AddAccessKeyArgsZodSchema } from '../_common/_common/zodSchemas/addAccessKey';

export const safeAddAccessKey: SafeCreateAddAccessKeyAction = wrapInternalError(
  'CreateAction.AddAccessKey.Internal',
  (args) => {
    const validArgs = AddAccessKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.AddAccessKey.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({ actionType: 'AddAccessKey' as const, ...args });
  },
);

export const addAccessKey: CreateAddAccessKeyAction = asThrowable(safeAddAccessKey);
