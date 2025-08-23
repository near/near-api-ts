import { base64 } from '@scure/base';
import { serializeSignedTransaction } from '@common/transformers/toBorshBytes/signedTransaction';
import type { CreateSendSignedTransaction } from 'nat-types/client/rpcMethods/transaction/sendSignedTransaction';

export const createSendSignedTransaction: CreateSendSignedTransaction =
  ({ sendRequest }) =>
  ({ signedTransaction, options = {} }) => {
    const { waitUntil = 'EXECUTED_OPTIMISTIC' } = options;
    return sendRequest({
      body: {
        method: 'send_tx',
        params: {
          signed_tx_base64: base64.encode(
            serializeSignedTransaction(signedTransaction),
          ),
          wait_until: waitUntil, // TODO get from enum
        },
      },
    });
  };
