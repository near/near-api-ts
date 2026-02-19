import { base64 } from '@scure/base';
import * as z from 'zod/mini';
import type { CreateDeployContractAction, SafeCreateDeployContractAction } from '../../../types/actions/deployContract';
import { createNatError } from '../../_common/natError';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

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
