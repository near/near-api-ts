import type {
  TransactionResult,
  TransactionResultCommon,
} from '../../../../../../../types/_common/transactionDetails/transactionResult';
import type { RpcFinalTransactionDetails } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import {
  getConversionStepError,
  getConversionStepSuccess,
} from './getProcessingSteps/getConversionStep';
import { getNonConversionSteps } from './getProcessingSteps/getNonConversionSteps/getNonConversionSteps';

export const getTransactionResultOutput = (
  finalDetails: RpcFinalTransactionDetails,
): TransactionResult => {
  const { transaction, transactionOutcome, status, receiptsOutcome, receipts } = finalDetails;

  const transactionSummary: TransactionResultCommon['transactionSummary'] = {
    signerAccountId: transaction.signerId,
    signerPublicKey: transaction.publicKey.publicKey,
    nonce: transaction.nonce,
    actionSummaries: transaction.actions, // TODO finish
    receiverAccountId: transaction.receiverId,
    signature: transaction.signature.signature,
  };

  // For some reason TypeScript can't figure out from Zod schema type that
  // when status = SuccessValue it means that transaction outcome is always SuccessReceiptId;
  // This is why we narrow the transactionOutcome type manually;

  // When the transaction execution is successful;
  if ('SuccessValue' in status && isRpcTransactionOutcomeSuccess(transactionOutcome)) {
    const conversionStepSuccess = getConversionStepSuccess(transactionOutcome);

    const { executionSteps, refundSteps } = getNonConversionSteps(
      transaction,
      receipts,
      receiptsOutcome,
      conversionStepSuccess,
    );

    return {
      transactionHash: transaction.hash.cryptoHash,
      processingStage: 'CompletedFinal',
      result: {
        status: 'Success',
        data: status.SuccessValue,
      },
      transactionSummary,
      processingSteps: {
        conversionStep: conversionStepSuccess,
        executionSteps,
        refundSteps,
      },
    };
  }

  // When the transaction wasn't even converted into a receipt and included in the block
  if (
    'Failure' in status &&
    'InvalidTxError' in status.Failure &&
    isRpcTransactionOutcomeFailure(transactionOutcome)
  ) {
    return {
      transactionHash: transaction.hash.cryptoHash,
      processingStage: 'CompletedFinal',
      result: {
        status: 'ConversionError',
        error: {
          kind: 'any',
          context: status.Failure.InvalidTxError,
        },
      },
      transactionSummary,
      processingSteps: {
        conversionStep: getConversionStepError(transactionOutcome),
        executionSteps: null,
        refundSteps: null,
      },
    };
  }

  // When the transaction was converted into a receipt and included in the block
  // but failed during execution
  if (
    'Failure' in status &&
    'ActionError' in status.Failure &&
    isRpcTransactionOutcomeSuccess(transactionOutcome)
  ) {
    return {
      transactionHash: transaction.hash.cryptoHash,
      processingStage: 'CompletedFinal',
      result: {
        status: 'ExecutionError',
        error: {
          kind: 'any',
          context: status.Failure.ActionError,
        },
      },
      transactionSummary,
      processingSteps: {
        conversionStep: getConversionStepSuccess(transactionOutcome),
        executionSteps: [],
        refundSteps: [],
      },
    };
  }

  // For TS only: we checked all possible cases
  throw new Error('Unreachable');
};
