import type { AccountId, BlockHash, ReceiptId, TransactionNonce } from '../../common';
import type { PublicKey, Signature } from '../../crypto';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ParsedActionSummary } from './_common/actionSummaries';
import type { ConversionFailureError } from './_common/conversionFailureError';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
} from './_common/deserializers';

export type TransactionActionSummaries<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = [ASF] extends [BaseDeserializeTransactionActionSummariesFn]
  ? ReturnType<ASF>
  : ParsedActionSummary[];

export type TransactionSummary<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  nonce: TransactionNonce;
  receiverAccountId: AccountId;
  actionSummaries: TransactionActionSummaries<ASF>;
  signature: Signature;
};

export type ConversionStepSuccess<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  result: {
    status: 'Success';
    firstExecutionStepId: ReceiptId;
  };
  executedAt: { blockHash: BlockHash };
  transactionSummary: TransactionSummary<ASF>;
  gasFee: NearToken;
  gasUsed: NearGas;
};

export type ConversionStepFailure<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  result: {
    status: 'Failure';
    error: ConversionFailureError;
  };
  executedAt: { blockHash: BlockHash };
  transactionSummary: TransactionSummary<ASF>;
  gasFee: NearToken;
  gasUsed: NearGas;
};
