import * as z from 'zod/mini';
import type {
  CreateAddFullAccessKeyAction,
  SafeCreateAddFullAccessKeyAction,
} from '../../../types/_common/transaction/actions/delegableActions/addKey';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';

export const CreateAddFullAccessKeyActionArgsSchema = z.object({
  publicKey: PublicKeyZodSchema,
});

export const safeAddFullAccessKey: SafeCreateAddFullAccessKeyAction = wrapInternalError(
  'CreateAction.AddFullAccessKey.Internal',
  (args) => {
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
  },
);

export const addFullAccessKey: CreateAddFullAccessKeyAction = asThrowable(safeAddFullAccessKey);
