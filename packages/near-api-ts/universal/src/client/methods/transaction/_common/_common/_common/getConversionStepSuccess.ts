import { gas, yoctoNear } from '../../../../../../../index';
import type { Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionStepSuccess } from '../../../../../../../types/_common/transactionDetails/_common/conversionStep';
import { type NatError } from '../../../../../../_common/natError';
import type { RpcTransactionOutcomeSuccess } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../_common/utils/result';
import { getTransactionSummary } from './_common/getTransactionSummary';

type GetConversionStepSuccessArgs = {
  transaction: RpcTransactionSummary;
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
};

export const getConversionStepSuccess = (
  args: GetConversionStepSuccessArgs,
): Result<
  ConversionStepSuccess,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const { transaction, transactionOutcomeSuccess, deserializeActionSummaries } = args;

  const transactionSummary = getTransactionSummary(transaction, deserializeActionSummaries);
  if (!transactionSummary.ok) return transactionSummary;

  return result.ok({
    result: {
      status: 'Success',
      firstExecutionStepId: transactionOutcomeSuccess.outcome.status.SuccessReceiptId.cryptoHash,
    },
    executedAt: { blockHash: transactionOutcomeSuccess.blockHash.cryptoHash },
    transactionSummary: transactionSummary.value,
    gasFee: yoctoNear(transactionOutcomeSuccess.outcome.tokensBurnt),
    gasUsed: gas(transactionOutcomeSuccess.outcome.gasBurnt),
  });
};
