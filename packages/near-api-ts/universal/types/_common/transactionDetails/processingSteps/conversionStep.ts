import type { AccountId, BlockHash, ReceiptId, TransactionNonce } from '../../common';
import type { PublicKey, Signature } from '../../crypto';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ParsedActionSummary } from '../actionSummaries';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
} from '../transactionResult';

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

type ConversionStepCommon<ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined> =
  {
    executedAt: { blockHash: BlockHash };
    transactionSummary: TransactionSummary<ASF>;
    gasFee: NearToken;
    gasUsed: NearGas;
  };

export type ConversionStepSuccess<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = ConversionStepCommon<ASF> & {
  result: {
    status: 'Success';
    firstExecutionStepId: ReceiptId;
  };
};

export type ConversionStepFailure<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = ConversionStepCommon<ASF> & {
  result: {
    status: 'Error';
    error: { kind: unknown; context: unknown };
  };
};
