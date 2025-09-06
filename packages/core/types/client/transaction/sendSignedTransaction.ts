import type { SignedTransaction } from 'nat-types/signedTransaction';
import type { ClientContext } from 'nat-types/client/client';
import type { TransactionExecutionStatus } from 'nat-types/transaction';
import type { RpcTransactionResponse } from '@near-js/jsonrpc-types';

type SendSignedTransactionArgs = {
  signedTransaction: SignedTransaction;
  request?: {
    waitForStatus?: TransactionExecutionStatus;
  };
};

export type SendSignedTransactionResult = RpcTransactionResponse;

export type SendSignedTransaction = (
  args: SendSignedTransactionArgs,
) => Promise<SendSignedTransactionResult>;

export type CreateSendSignedTransaction = (
  clientContext: ClientContext,
) => SendSignedTransaction;
