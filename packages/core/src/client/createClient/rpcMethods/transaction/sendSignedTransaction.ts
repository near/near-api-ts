import { base64 } from '@scure/base';
import { serializeSignedTransactionToBorsh } from '@common/transformers/signedTransaction';
import type { ClientMethodContext } from '../../createClient';
import type { SignedTransaction } from 'nat-types/transaction';

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
            serializeSignedTransactionToBorsh(signedTransaction),
          ),
          wait_until: waitUntil,
        },
      },
    });
  };
