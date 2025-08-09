import { base64 } from '@scure/base';
import { toBorshSignedTransaction } from '@common/transformers/borsh/toBorshSignedTransaction';
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
            toBorshSignedTransaction(signedTransaction),
          ),
          wait_until: waitUntil,
        },
      },
    });
  };
