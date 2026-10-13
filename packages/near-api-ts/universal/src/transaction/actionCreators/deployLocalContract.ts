import * as z from 'zod/mini';
import type {
  CreateDeployLocalContractAction,
  SafeCreateDeployLocalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/deployLocalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';

export const CreateDeployLocalContractActionArgsSchema = z.union([
  z.object({
    wasmU8: z.instanceof(Uint8Array),
    wasmBase64: z.optional(z.never()),
  }),
  z.object({
    wasmU8: z.optional(z.never()),
    wasmBase64: z.base64(),
  }),
]);

export const safeDeployLocalContract: SafeCreateDeployLocalContractAction = wrapInternalError(
  'CreateAction.DeployLocalContract.Internal',
  (args) => {
    const validArgs = CreateDeployLocalContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.DeployLocalContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const wasmU8 = validArgs.data.wasmU8
      ? validArgs.data.wasmU8
      : Uint8Array.fromBase64(validArgs.data.wasmBase64);

    return result.ok({
      actionType: 'DeployLocalContract' as const,
      wasmU8,
    });
  },
);

export const deployLocalContract: CreateDeployLocalContractAction =
  asThrowable(safeDeployLocalContract);
