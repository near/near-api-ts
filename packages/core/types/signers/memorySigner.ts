import type {AccountId, Milliseconds} from 'nat-types/common';
import type { PublicKey } from 'nat-types/crypto';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService';
import type { TransactionIntent } from 'nat-types/transaction';
import type { SignedTransaction } from 'nat-types/signedTransaction';
import type { SendSignedTransactionResult } from 'nat-types/client/methods/transaction/sendSignedTransaction';

type ExecuteMultipleTransactionsResult = (
  | { status: 'Success'; result: SendSignedTransactionResult }
  | { status: 'Error'; error: unknown }
  | { status: 'Canceled' }
)[];

type SignMultipleTransactionsResult = (
  | { status: 'Success'; result: SignedTransaction }
  | { status: 'Error'; error: unknown }
  | { status: 'Canceled' }
)[];

// TODO add policies
export type MemorySigner = {
  executeTransaction: (
    args: TransactionIntent,
  ) => Promise<SendSignedTransactionResult>;

  executeMultipleTransactions: (args: {
    transactionIntents: TransactionIntent[];
  }) => Promise<ExecuteMultipleTransactionsResult>;

  signTransaction: (args: TransactionIntent) => Promise<SignedTransaction>;

  signMultipleTransactions: (args: {
    transactionIntents: TransactionIntent[];
  }) => Promise<SignMultipleTransactionsResult>;
};

type CreateMemorySignerArgs = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  keyPool?: {
    signingKeys?: PublicKey[];
  };
  queue?: {
    taskTtlMs?: Milliseconds;
  };
};

export type SignerContext = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  signingKeys?: PublicKey[];
  taskTtlMs?: Milliseconds;
};

export type CreateMemorySigner = (
  args: CreateMemorySignerArgs,
) => Promise<MemorySigner>;
