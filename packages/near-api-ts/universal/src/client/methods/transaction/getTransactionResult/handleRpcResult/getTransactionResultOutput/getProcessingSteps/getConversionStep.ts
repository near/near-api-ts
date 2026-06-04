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
import { getActionSummaries } from './_common/getActionSummaries';

const getTransactionSummary = (transaction: RpcTransactionSummary): TransactionSummary => ({
  signerAccountId: transaction.signerId,
  signerPublicKey: transaction.publicKey.publicKey,
  nonce: transaction.nonce,
  receiverAccountId: transaction.receiverId,
  actionSummaries: getActionSummaries(transaction.actions),
  signature: transaction.signature.signature,
});

export const getConversionStepSuccess = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeSuccess,
): ConversionStepSuccess => ({
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
