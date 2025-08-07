import type {
  AccountId,
  BlockHash,
  AccessKeyNonce,
  Base58String,
} from './common';
import type { PublicKey, Signature } from './crypto';

export type CreateAccountAction = {
  type: 'CreateAccount';
};

export type TransferAction = {
  type: 'Transfer';
  params: {
    amount: {
      yoctoNear: bigint;
    };
  };
};

export type Action = CreateAccountAction | TransferAction;

export type Transaction = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  action?: Action;
  actions?: Action[];
  receiverAccountId: AccountId;
  nonce: AccessKeyNonce;
  blockHash: BlockHash;
};

export type TransactionHash = Base58String;

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: TransactionHash;
  signature: Signature;
};
