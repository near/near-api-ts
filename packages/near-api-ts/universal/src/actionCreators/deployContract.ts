import * as z from 'zod/mini';
import type {
  CreateDeployContractAction,
  SafeCreateDeployContractAction,
} from '../../types/_common/transaction/actions/nonDelegateActions/deployContract';
import { createNatError } from '../_common/_common/_common/natError';
import { asThrowable } from '../_common/_common/asThrowable';
import { result } from '../_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';

export const CreateDeployContractActionArgsSchema = z.union([
  z.object({
    wasmBase64: z.base64(),
    wasmBytes: z.optional(z.never()), // TODO rename to wasmU8
  }),
  z.object({
    wasmBase64: z.optional(z.never()),
    wasmBytes: z.instanceof(Uint8Array),
  }),
]);

export const safeDeployContract: SafeCreateDeployContractAction = wrapInternalError(
  'CreateAction.DeployContract.Internal',
  (args) => {
    const validArgs = CreateDeployContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.DeployContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const wasmU8 = validArgs.data.wasmBytes
      ? validArgs.data.wasmBytes
      : Uint8Array.fromBase64(validArgs.data.wasmBase64);

    return result.ok({
      actionType: 'DeployContract' as const,
      wasmBytes: wasmU8,
    });
  },
);

export const throwableDeployContract: CreateDeployContractAction = asThrowable(safeDeployContract);
