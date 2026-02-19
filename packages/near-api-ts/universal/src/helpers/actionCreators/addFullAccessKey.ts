import * as z from 'zod/mini';
import type { CreateAddFullAccessKeyAction, SafeCreateAddFullAccessKeyAction } from '../../../types/actions/addKey';
import { createNatError } from '../../_common/natError';
import { PublicKeySchema } from '../../_common/schemas/zod/common/publicKey';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

export const CreateAddFullAccessKeyActionArgsSchema = z.object({
  publicKey: PublicKeySchema,
});

export const safeAddFullAccessKey: SafeCreateAddFullAccessKeyAction =
  wrapInternalError('CreateAction.AddFullAccessKey.Internal', (args) => {
    const validArgs = CreateAddFullAccessKeyActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.AddFullAccessKey.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'AddKey' as const,
      accessType: 'FullAccess' as const,
      publicKey: args.publicKey,
    });
  });

export const throwableAddFullAccessKey: CreateAddFullAccessKeyAction =
  asThrowable(safeAddFullAccessKey);
