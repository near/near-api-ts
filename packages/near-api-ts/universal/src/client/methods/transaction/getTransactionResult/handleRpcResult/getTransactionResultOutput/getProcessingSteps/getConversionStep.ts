import { gas, yoctoNear } from '../../../../../../../../index';
import type {
  ConversionStepError,
  ConversionStepSuccess,
} from '../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type {
  RpcTransactionOutcomeFailure,
  RpcTransactionOutcomeSuccess,
} from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';

export const getConversionStepSuccess = (
  transactionOutcome: RpcTransactionOutcomeSuccess,
): ConversionStepSuccess => ({
  result: {
    status: 'Success',
    receiptId: transactionOutcome.outcome.status.SuccessReceiptId.cryptoHash,
  },
  executedAt: { blockHash: transactionOutcome.blockHash.cryptoHash },
  gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
  gasUsed: gas(transactionOutcome.outcome.gasBurnt),
});

export const getConversionStepError = (
  transactionOutcome: RpcTransactionOutcomeFailure,
): ConversionStepError => ({
  result: {
    status: 'Error',
    error: {
      kind: 'error',
      context: 'any',
    },
  },
  executedAt: { blockHash: transactionOutcome.blockHash.cryptoHash },
  gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
  gasUsed: gas(transactionOutcome.outcome.gasBurnt),
});
