import { gas, yoctoNear } from '../../../../../../../../index';
import type {
  ConversionStepError,
  ConversionStepSuccess,
  TransactionSummary,
} from '../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type {
  RpcTransactionOutcomeFailure,
  RpcTransactionOutcomeSuccess,
} from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';

const getTransactionSummary = (transaction: RpcTransactionSummary): TransactionSummary => ({
  signerAccountId: transaction.signerId,
  signerPublicKey: transaction.publicKey.publicKey,
  nonce: transaction.nonce,
  receiverAccountId: transaction.receiverId,
  actionSummaries: transaction.actions, // TODO finish
  signature: transaction.signature.signature,
});

export const getConversionStepSuccess = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeSuccess,
): ConversionStepSuccess => ({
  conversionStepId: transaction.hash.cryptoHash,
  result: {
    status: 'Success',
    firstExecutionStepId: transactionOutcome.outcome.status.SuccessReceiptId.cryptoHash,
  },
  executedAt: { blockHash: transactionOutcome.blockHash.cryptoHash },
  transactionSummary: getTransactionSummary(transaction),
  gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
  gasUsed: gas(transactionOutcome.outcome.gasBurnt),
});

export const getConversionStepError = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeFailure,
): ConversionStepError => ({
  result: {
    status: 'Error',
    error: {
      kind: 'error',
      context: 'any',
    },
  },
  executedAt: {
    blockHash: transactionOutcome.blockHash.cryptoHash,
  },
  transactionSummary: getTransactionSummary(transaction),
  gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
  gasUsed: gas(transactionOutcome.outcome.gasBurnt),
});
