import { gas, yoctoNear } from '../../../../../../../index';
import type { Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../types/_common/transactionDetails/deserializers';
import type { ConversionStepSuccess } from '../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep/conversionStep';
import { type NatError } from '../../../../../../_common/natError';
import type { RpcTransactionOutcomeSuccess } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../_common/utils/result';
import { getTransactionSummary } from './_common/getTransactionSummary';

export const getConversionStepSuccess = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeSuccess,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  ConversionStepSuccess,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const transactionSummary = getTransactionSummary(transaction, deserializeActionSummaries);
  if (!transactionSummary.ok) return transactionSummary;

  return result.ok({
    result: {
      status: 'Success',
      firstExecutionStepId: transactionOutcome.outcome.status.SuccessReceiptId.cryptoHash,
    },
    executedAt: { blockHash: transactionOutcome.blockHash.cryptoHash },
    transactionSummary: transactionSummary.value,
    gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
    gasUsed: gas(transactionOutcome.outcome.gasBurnt),
  });
};
