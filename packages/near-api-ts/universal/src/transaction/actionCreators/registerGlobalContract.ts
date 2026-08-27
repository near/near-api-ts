import * as z from 'zod/mini';
import type {
  CreateRegisterGlobalContractAction,
  SafeCreateRegisterGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/registerGlobalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';

const GlobalContractReferenceZodSchema = z.union([
  z.literal('WasmHash'),
  z.literal('OwnerAccountId'),
]);

export const CreateRegisterGlobalContractActionArgsSchema = z.union([
  z.object({
    wasmBase64: z.base64(),
    wasmBytes: z.optional(z.never()), // TODO rename to wasmU8
    referenceBy: GlobalContractReferenceZodSchema,
  }),
  z.object({
    wasmBase64: z.optional(z.never()),
    wasmBytes: z.instanceof(Uint8Array),
    referenceBy: GlobalContractReferenceZodSchema,
  }),
]);

export const safeRegisterGlobalContract: SafeCreateRegisterGlobalContractAction = wrapInternalError(
  'CreateAction.RegisterGlobalContract.Internal',
  (args) => {
    const validArgs = CreateRegisterGlobalContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.RegisterGlobalContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const wasmU8 = validArgs.data.wasmBytes
      ? validArgs.data.wasmBytes
      : Uint8Array.fromBase64(validArgs.data.wasmBase64);

    return result.ok({
      actionType: 'RegisterGlobalContract' as const,
      wasmBytes: wasmU8,
      referenceBy: validArgs.data.referenceBy,
    });
  },
);

export const throwableRegisterGlobalContract: CreateRegisterGlobalContractAction = asThrowable(
  safeRegisterGlobalContract,
);
