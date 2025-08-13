import { base64 } from '@scure/base';
import { serializeSignedTransaction } from '@common/transformers/toBorshBytes/signedTransaction';
import type { ClientMethodContext } from '../../createClient';
import type { SignedTransaction } from 'nat-types/signedTransaction';

// https://docs.near.org/api/rpc/contracts#view-account

type SendSignedTransactionArgs = {
  signedTransaction: SignedTransaction;
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
            serializeSignedTransaction(signedTransaction),
          ),
          wait_until: waitUntil,
        },
      },
    });
  };
