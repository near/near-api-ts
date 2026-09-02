import * as z from 'zod/mini';
import type {
  CreateRegisterGlobalContractAction,
  SafeCreateRegisterGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/registerGlobalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';

const GlobalContractWasmMutabilityZodSchema = z.union([
  z.literal('Mutable'),
  z.literal('Immutable'),
]);

export const CreateRegisterGlobalContractActionArgsSchema = z.union([
  z.object({
    wasmU8: z.instanceof(Uint8Array),
    wasmBase64: z.optional(z.never()),
    wasmMutability: GlobalContractWasmMutabilityZodSchema,
  }),
  z.object({
    wasmU8: z.optional(z.never()),
    wasmBase64: z.base64(),
    wasmMutability: GlobalContractWasmMutabilityZodSchema,
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

    const wasmU8 = validArgs.data.wasmU8
      ? validArgs.data.wasmU8
      : Uint8Array.fromBase64(validArgs.data.wasmBase64);

    return result.ok({
      actionType: 'RegisterGlobalContract' as const,
      wasmU8,
      wasmMutability: validArgs.data.wasmMutability,
    });
  },
);

export const registerGlobalContract: CreateRegisterGlobalContractAction = asThrowable(
  safeRegisterGlobalContract,
);
