import * as z from 'zod/mini';
import type {
  CreateSafeGetTransactionResult,
  SafeGetTransactionResult,
} from '../../../../../types/client/methods/transaction/getTransactionResult';
import { resultNatError } from '../../../../_common/natError';
import { BaseOptionsSchema, PoliciesSchema } from '../../../../_common/schemas/zod/client';
import { AccountIdSchema } from '../../../../_common/schemas/zod/common/accountId';
import { CryptoHashSchema } from '../../../../_common/schemas/zod/common/cryptoHash';
import { repackError } from '../../../../_common/utils/repackError';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { handleError } from './handleError/handleError';
import { handleResult } from './handleResult/handleResult';

const GetTransactionResultArgsZodShema = z.object({
  transactionHash: CryptoHashSchema,
  signerAccountId: AccountIdSchema,
  policies: PoliciesSchema,
  options: BaseOptionsSchema,
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
          sender_account_id: validArgs.data.signerAccountId,
          wait_until: 'NONE',
        },
        transportPolicy: args.policies?.transport,
        signal: args.options?.signal,
      });

      console.log(rpcResponse);

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
