import * as z from 'zod/mini';
import type {
  CreatePinGlobalContractAction,
  SafeCreatePinGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/pinGlobalContract';

import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { CryptoHashZodSchema } from '../../_common/zodSchemas/cryptoHash';

export const CreatePinGlobalContractActionArgsZodSchema = z.object({
  globalContractWasmHash: CryptoHashZodSchema,
});

export const safePinGlobalContract: SafeCreatePinGlobalContractAction = wrapInternalError(
  'CreateAction.PinGlobalContract.Internal',
  (args) => {
    const validArgs = CreatePinGlobalContractActionArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateAction.PinGlobalContract.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return result.ok({
      actionType: 'PinGlobalContract' as const,
      globalContractWasmHash: validArgs.data.globalContractWasmHash.cryptoHash,
    });
  },
);

export const pinGlobalContract: CreatePinGlobalContractAction = asThrowable(safePinGlobalContract);
