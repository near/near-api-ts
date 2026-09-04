import * as z from 'zod/mini';
import type {
  CreateRegisterLinkableGlobalContractAction,
  SafeCreateRegisterLinkableGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/registerLinkableGlobalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';

export const CreateRegisterLinkableGlobalContractActionArgsSchema = z.union([
  z.object({
    wasmU8: z.instanceof(Uint8Array),
    wasmBase64: z.optional(z.never()),
  }),
  z.object({
    wasmU8: z.optional(z.never()),
    wasmBase64: z.base64(),
  }),
]);

export const safeRegisterLinkableGlobalContract: SafeCreateRegisterLinkableGlobalContractAction =
  wrapInternalError('CreateAction.RegisterLinkableGlobalContract.Internal', (args) => {
    const validArgs = CreateRegisterLinkableGlobalContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.RegisterLinkableGlobalContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const wasmU8 = validArgs.data.wasmU8
      ? validArgs.data.wasmU8
      : Uint8Array.fromBase64(validArgs.data.wasmBase64);

    return result.ok({
      actionType: 'RegisterLinkableGlobalContract' as const,
      wasmU8,
    });
  });

export const registerLinkableGlobalContract: CreateRegisterLinkableGlobalContractAction =
  asThrowable(safeRegisterLinkableGlobalContract);
