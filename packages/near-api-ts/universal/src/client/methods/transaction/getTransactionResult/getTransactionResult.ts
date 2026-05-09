import * as z from 'zod/mini';
import type {
  CreateSafeGetTransactionResult,
  SafeGetTransactionResult,
} from '../../../../../types/client/methods/transaction/getTransactionResult';
import { resultNatError } from '../../../../_common/natError';
import { BaseOptionsZodSchema, PoliciesZodSchema } from '../../../../_common/schemas/zod/client';
import { CryptoHashZodSchema } from '../../../../_common/schemas/zod/common/cryptoHash';
import { repackError } from '../../../../_common/utils/repackError';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { handleError } from './handleError';
import { handleResult } from './handleResult/handleResult';

const GetTransactionResultArgsZodShema = z.object({
  transactionHash: CryptoHashZodSchema,
  policies: PoliciesZodSchema,
  options: BaseOptionsZodSchema,
});

export const createSafeGetTransactionResult: CreateSafeGetTransactionResult = (context) =>
  wrapInternalError(
    'Client.GetTransactionResult.Internal',
    async (args): ReturnType<SafeGetTransactionResult> => {
      const validArgs = GetTransactionResultArgsZodShema.safeParse(args);

      if (!validArgs.success)
        return resultNatError('Client.GetTransactionResult.Args.InvalidSchema', {
          zodError: validArgs.error,
        });

      const rpcResponse = await context.sendRequest({
        method: 'EXPERIMENTAL_tx_status',
        params: {
          tx_hash: validArgs.data.transactionHash.cryptoHash,
          sender_account_id: 'any', // We expect that RPC tracks all shards, so signerAccountId doesn't matter
          wait_until: 'NONE',
        },
        transportPolicy: args.policies?.transport,
        signal: args.options?.signal,
      });

      if (!rpcResponse.ok)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.GetTransactionResult',
        });

      return rpcResponse.value.error
        ? handleError(rpcResponse.value)
        : handleResult(rpcResponse.value, args);
    },
  );
