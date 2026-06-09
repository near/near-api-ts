import type { AccountId, BlockHash, ReceiptId, TransactionNonce } from '../../common';
import type { PublicKey, Signature } from '../../crypto';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ActionSummary } from '../actionSummaries';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
} from '../transactionResult';

export type ActionSummaries<
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = [AS] extends [BaseDeserializeTransactionActionSummariesFn] ? ReturnType<AS> : ActionSummary[];

export type TransactionSummary<
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  nonce: TransactionNonce;
  receiverAccountId: AccountId;
  actionSummaries: ActionSummaries<AS>;
  signature: Signature;
};

type ConversionStepCommon<AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined> =
  {
    executedAt: { blockHash: BlockHash };
    transactionSummary: TransactionSummary<AS>;
    gasFee: NearToken;
    gasUsed: NearGas;
  };

export type ConversionStepSuccess<
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = ConversionStepCommon<AS> & {
  result: {
    status: 'Success';
    firstExecutionStepId: ReceiptId;
  };
};

export type ConversionStepError<
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = ConversionStepCommon<AS> & {
  result: {
    status: 'Error';
    error: { kind: unknown; context: unknown };
  };
};
