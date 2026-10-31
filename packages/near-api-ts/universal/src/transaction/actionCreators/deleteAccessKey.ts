import * as z from 'zod/mini';
import type {
  CreateDeleteAccessKeyAction,
  SafeCreateDeleteAccessKeyAction,
} from '../../../types/_common/transaction/actions/delegableActions/deleteAccessKey';

import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';

export const CreateDeleteAccessKeyActionArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
});

export const safeDeleteAccessKey: SafeCreateDeleteAccessKeyAction = wrapInternalError(
  'CreateAction.DeleteAccessKey.Internal',
  (args) => {
    const validArgs = CreateDeleteAccessKeyActionArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateAction.DeleteAccessKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return result.ok({
      actionType: 'DeleteAccessKey' as const,
      publicKey: args.publicKey,
    });
  },
);

export const deleteAccessKey: CreateDeleteAccessKeyAction = asThrowable(safeDeleteAccessKey);
