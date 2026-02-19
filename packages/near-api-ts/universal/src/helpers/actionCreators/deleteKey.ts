import * as z from 'zod/mini';
import type { CreateDeleteKeyAction, SafeCreateDeleteKeyAction } from '../../../types/actions/deleteKey';
import { createNatError } from '../../_common/natError';
import { PublicKeySchema } from '../../_common/schemas/zod/common/publicKey';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

export const CreateDeleteKeyActionArgsSchema = z.object({
  publicKey: PublicKeySchema,
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

export const throwableDeleteKey: CreateDeleteKeyAction =
  asThrowable(safeDeleteKey);
