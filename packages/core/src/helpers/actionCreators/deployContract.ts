import * as z from 'zod/mini';
import { base64 } from '@scure/base';
import type {
  CreateDeployContractAction,
  SafeCreateDeployContractAction,
} from 'nat-types/actions/deployContract';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { asThrowable } from '@common/utils/asThrowable';

export const CreateDeployContractActionArgsSchema = z.union([
  z.object({
    wasmBase64: z.base64(),
    wasmBytes: z.optional(z.never()),
  }),
  z.object({
    wasmBase64: z.optional(z.never()),
    wasmBytes: z.instanceof(Uint8Array),
  }),
]);

export const safeDeployContract: SafeCreateDeployContractAction =
  wrapInternalError('CreateAction.DeployContract.Internal', (args) => {
    const validArgs = CreateDeployContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.DeployContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const u8Wasm = validArgs.data.wasmBytes
      ? validArgs.data.wasmBytes
      : base64.decode(validArgs.data.wasmBase64);

    return result.ok({
      actionType: 'DeployContract' as const,
      wasmBytes: u8Wasm,
    });
  });

export const throwableDeployContract: CreateDeployContractAction =
  asThrowable(safeDeployContract);
