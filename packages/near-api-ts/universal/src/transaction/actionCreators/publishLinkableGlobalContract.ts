import * as z from 'zod/mini';
import type {
  CreatePublishLinkableGlobalContractAction,
  SafeCreatePublishLinkableGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/publishLinkableGlobalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';

export const CreatePublishLinkableGlobalContractActionArgsSchema = z.union([
  z.object({
    wasmU8: z.instanceof(Uint8Array),
    wasmBase64: z.optional(z.never()),
  }),
  z.object({
    wasmU8: z.optional(z.never()),
    wasmBase64: z.base64(),
  }),
]);

export const safePublishLinkableGlobalContract: SafeCreatePublishLinkableGlobalContractAction =
  wrapInternalError('CreateAction.PublishLinkableGlobalContract.Internal', (args) => {
    const validArgs = CreatePublishLinkableGlobalContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.PublishLinkableGlobalContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const wasmU8 = validArgs.data.wasmU8
      ? validArgs.data.wasmU8
      : Uint8Array.fromBase64(validArgs.data.wasmBase64);

    return result.ok({
      actionType: 'PublishLinkableGlobalContract' as const,
      wasmU8,
    });
  });

export const publishLinkableGlobalContract: CreatePublishLinkableGlobalContractAction = asThrowable(
  safePublishLinkableGlobalContract,
);
