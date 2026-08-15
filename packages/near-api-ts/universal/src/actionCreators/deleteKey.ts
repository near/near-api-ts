import * as z from 'zod/mini';
import type {
  CreateDeleteKeyAction,
  SafeCreateDeleteKeyAction,
} from '../../types/_common/transaction/actions/nonDelegateActions/deleteKey';
import { createNatError } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';

export const CreateDeleteKeyActionArgsSchema = z.object({
  publicKey: PublicKeyZodSchema,
});

export const safeDeleteKey: SafeCreateDeleteKeyAction = wrapInternalError(
  'CreateAction.DeleteKey.Internal',
  (args) => {
    const validArgs = CreateDeleteKeyActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.DeleteKey.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'DeleteKey' as const,
      publicKey: args.publicKey,
    });
  },
);

export const throwableDeleteKey: CreateDeleteKeyAction = asThrowable(safeDeleteKey);
