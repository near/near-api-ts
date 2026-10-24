import type { AccountId, BlockHash, ReceiptId } from '../../../../../../_common/common';
import type { PublicKey, Signature } from '../../../../../../_common/crypto';
import type { NearGas } from '../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../_common/nearToken';
import type { SignedTransactionReplayProtection } from '../../../../../../_common/transaction/transaction';
import type { ParsedTransactionActionSummary } from './_common/actionSummaries';
import type { ConversionFailureError } from './_common/conversionFailureError';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
} from './_common/deserializers';
import type { ProtocolEra } from './_common/protocolEra';

// Checks against a deserializer of `'Live'` data rather than of `PE`, which must stay out of
// `extends` clauses - see `ProtocolEra`. A deserializer of any era takes `'Live'` data too.
export type TransactionActionSummaries<
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
> = [ASF] extends [BaseDeserializeTransactionActionSummariesFn<'Live'>]
  ? ReturnType<ASF>
  : ParsedTransactionActionSummary<PE>[];

export type TransactionSummary<
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
> = {
  signer: {
    accountId: AccountId;
    publicKey: PublicKey;
    replayProtection: SignedTransactionReplayProtection;
  };
  receiverAccountId: AccountId;
  actionSummaries: TransactionActionSummaries<PE, ASF>;
  signature: Signature;
};

export type ConversionStepSuccess<
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
> = {
  result: {
    status: 'Success';
    firstExecutionStepId: ReceiptId;
  };
  executedAt: { blockHash: BlockHash };
  transactionSummary: TransactionSummary<PE, ASF>;
  gasFee: NearToken;
  gasUsed: NearGas;
};

export type ConversionStepFailure<
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
> = {
  result: {
    status: 'Failure';
    error: ConversionFailureError;
  };
  executedAt: { blockHash: BlockHash };
  transactionSummary: TransactionSummary<PE, ASF>;
  gasFee: NearToken;
  gasUsed: NearGas;
};
