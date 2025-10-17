import { base64 } from '@scure/base';
import { serializeSignedTransaction } from '@common/transformers/toBorshBytes/signedTransaction';
import { toNativeTransactionExecutionStatus } from '@common/transformers/toNative/transaction';
import { RpcTransactionResponseSchema } from '@near-js/jsonrpc-types';
import type {
  CreateSendSignedTransaction,
  SendSignedTransactionResult,
} from 'nat-types/client/methods/transaction/sendSignedTransaction';

const transformResult = (result: unknown): SendSignedTransactionResult => {
  return RpcTransactionResponseSchema().parse(result);
};

export const createSendSignedTransaction: CreateSendSignedTransaction =
  ({ sendRequest }) =>
  async (args) => {
    const waitUntil = args?.policies?.waitUntil ?? 'ExecutedOptimistic';

    const result = await sendRequest({
      method: 'send_tx',
      params: {
        signed_tx_base64: base64.encode(
          serializeSignedTransaction(args.signedTransaction),
        ),
        wait_until: toNativeTransactionExecutionStatus(waitUntil),
      },
    });
    return transformResult(result);
  };
