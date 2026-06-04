import type { AccountId, BlockHash, ReceiptId, TransactionNonce } from '../../common';
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

type ConversionStepCommon = {
  executedAt: { blockHash: BlockHash };
  transactionSummary: TransactionSummary;
  gasFee: NearToken;
  gasUsed: NearGas;
};

export type ConversionStepSuccess = ConversionStepCommon & {
  result: {
    status: 'Success';
    firstExecutionStepId: ReceiptId;
  };
};

export type ConversionStepError = ConversionStepCommon & {
  result: {
    status: 'Error';
    error: { kind: unknown; context: unknown };
  };
};
