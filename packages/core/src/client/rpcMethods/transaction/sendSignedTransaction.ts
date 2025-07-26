import { base64 } from '@scure/base';
import { toBorshedSignedTransaction } from '../../../keyServices/memoryKeyService/toBorshedSignedTransaction';
import type { ClientMethodContext } from '../../createClient';
import type { InnerSignedTransaction } from '../../../keyServices/memoryKeyService/toBorshedSignedTransaction';

// https://docs.near.org/api/rpc/contracts#view-account

type SendSignedTransactionArgs = {
  signedTransaction: InnerSignedTransaction;
  options?: {
    waitUntil?: string;
  };
};

// TODO use generated type
type SendTransactionSignedResult = object;

export type SendSignedTransaction = (
  args: SendSignedTransactionArgs,
) => Promise<SendTransactionSignedResult>;

export const sendSignedTransaction =
  ({ sendRequest }: ClientMethodContext): SendSignedTransaction =>
  ({ signedTransaction, options = {} }) => {
    const { waitUntil = 'EXECUTED_OPTIMISTIC' } = options;
    return sendRequest({
      body: {
        method: 'send_tx',
        params: {
          signed_tx_base64: base64.encode(
            toBorshedSignedTransaction(signedTransaction),
          ),
          wait_until: waitUntil,
        },
      },
    });
  };
