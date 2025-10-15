import { base64 } from '@scure/base';
import { serializeSignedTransaction } from '@common/transformers/toBorshBytes/signedTransaction';
import { toNativeTransactionExecutionStatus } from '@common/transformers/toNative/transaction';
import { RpcTransactionResponseSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type {
  CreateSendSignedTransaction,
  SendSignedTransactionResult,
} from 'nat-types/client/methods/transaction/sendSignedTransaction';

const transformResult = (result: unknown): SendSignedTransactionResult => {
  const camelCased = snakeToCamelCase(result);
  return RpcTransactionResponseSchema().parse(camelCased);
};

export const createSendSignedTransaction: CreateSendSignedTransaction =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      body: {
        method: 'send_tx',
        params: {
          signed_tx_base64: base64.encode(
            serializeSignedTransaction(args.signedTransaction),
          ),
          wait_until: toNativeTransactionExecutionStatus(args?.waitUntil),
        },
      },
    });
    return transformResult(result);
  };
