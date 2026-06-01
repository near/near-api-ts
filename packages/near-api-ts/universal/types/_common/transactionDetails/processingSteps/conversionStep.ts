import type {
  AccountId,
  BlockHash,
  ReceiptId,
  TransactionHash,
  TransactionNonce,
} from '../../common';
import type { PublicKey, Signature } from '../../crypto';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ActionSummaries } from '../actionSummaries';

export type TransactionSummary = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  nonce: TransactionNonce;
  receiverAccountId: AccountId;
  actionSummaries: ActionSummaries;
  signature: Signature;
};

export type ConversionStepSuccess = {
  conversionStepId: TransactionHash;
  result: {
    status: 'Success';
    firstExecutionStepId: ReceiptId;
  };
  executedAt: { blockHash: BlockHash };
  transactionSummary: TransactionSummary;
  gasFee: NearToken;
  gasUsed: NearGas;
};

export type ConversionStepError = {
  result: {
    status: 'Error';
    error: { kind: unknown; context: unknown };
  };
  executedAt: { blockHash: BlockHash };
  transactionSummary: TransactionSummary;
  gasFee: NearToken;
  gasUsed: NearGas;
};
