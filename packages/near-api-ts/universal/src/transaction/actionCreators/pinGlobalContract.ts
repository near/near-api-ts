import * as z from 'zod/mini';
import type {
  CreatePinGlobalContractAction,
  SafeCreatePinGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/pinGlobalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { CryptoHashZodSchema } from '../../_common/zodSchemas/cryptoHash';

export const CreatePinGlobalContractActionArgsSchema = z.object({
  globalContractWasmHash: CryptoHashZodSchema,
});

export const safePinGlobalContract: SafeCreatePinGlobalContractAction = wrapInternalError(
  'CreateAction.PinGlobalContract.Internal',
  (args) => {
    const validArgs = CreatePinGlobalContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.PinGlobalContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'PinGlobalContract' as const,
      globalContractWasmHash: validArgs.data.globalContractWasmHash.cryptoHash,
    });
  },
);

export const throwablePinGlobalContract: CreatePinGlobalContractAction =
  asThrowable(safePinGlobalContract);
