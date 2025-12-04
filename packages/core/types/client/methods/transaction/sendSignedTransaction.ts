
import type { ClientContext } from 'nat-types/client/client';
import type {
  SignedTransaction,
  TransactionExecutionStatus
} from 'nat-types/transaction';
import type { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import type { TransportPolicy } from 'nat-types/client/transport';

type SendSignedTransactionArgs = {
  signedTransaction: SignedTransaction;
  policies?: {
    waitUntil?: TransactionExecutionStatus;
    transport?: TransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type SendSignedTransactionResult = RpcTransactionResponse;

export type SendSignedTransaction = (
  args: SendSignedTransactionArgs,
) => Promise<SendSignedTransactionResult>;

export type CreateSendSignedTransaction = (
  clientContext: ClientContext,
) => SendSignedTransaction;
