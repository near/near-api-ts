import * as z from 'zod/mini';
import type {
  CreateSafeSendSignedTransaction,
  SafeSendSignedTransaction,
} from '../../../../../types/client/methods/transaction/sendSignedTransaction';
import { resultNatError } from '../../../../_common/natError';
import { BaseOptionsZodSchema, PoliciesZodSchema } from '../../../../_common/schemas/zod/client';
import { repackError } from '../../../../_common/utils/repackError';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { handleRpcError } from './handleRpcError/handleRpcError';
import { handleRpcResult } from './handleRpcResult/handleRpcResult';

const SendSignedTransactionArgsShema = z.object({
  signedTransactionBorsh64: z.base64(),
  policies: PoliciesZodSchema,
  options: BaseOptionsZodSchema,
});

export const createSafeSendSignedTransaction: CreateSafeSendSignedTransaction = (context) =>
  wrapInternalError(
    'Client.SendSignedTransaction.Internal',
    async (args): ReturnType<SafeSendSignedTransaction> => {
      const validArgs = SendSignedTransactionArgsShema.safeParse(args);

      if (!validArgs.success)
        return resultNatError('Client.SendSignedTransaction.Args.InvalidSchema', {
          zodError: validArgs.error,
        });

      const rpcResponse = await context.sendRequest({
        method: 'send_tx',
        params: {
          signed_tx_base64: args.signedTransactionBorsh64,
          wait_until: 'EXECUTED_OPTIMISTIC',
        },
        transportPolicy: args.policies?.transport,
        signal: args.options?.signal,
      });

      if (!rpcResponse.ok)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.SendSignedTransaction',
        });

      return rpcResponse.value.error
        ? handleRpcError(rpcResponse.value)
        : handleRpcResult(rpcResponse.value);
    },
  );
