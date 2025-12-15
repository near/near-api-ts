import * as z from 'zod/mini';
import type {
  CreateAddFullAccessKeyAction,
  SafeCreateAddFullAccessKeyAction,
} from 'nat-types/actions/addKey';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { asThrowable } from '@common/utils/asThrowable';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';

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
