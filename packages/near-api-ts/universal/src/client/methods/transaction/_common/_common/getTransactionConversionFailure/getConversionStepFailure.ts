import type { InvalidTxError } from '@near-js/jsonrpc-types';
import { gas, yoctoNear } from '../../../../../../../index';
import type { Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../types/_common/transactionDetails/deserializers';
import type { ConversionStepFailure } from '../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import { type NatError } from '../../../../../../_common/natError';
import type { RpcTransactionOutcomeFailure } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../_common/utils/result';
import { getTransactionSummary } from '../_common/_common/getTransactionSummary';
import { getConversionError } from './getConversionError';

export const getConversionStepFailure = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeFailure,
  invalidTxError: InvalidTxError,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  ConversionStepFailure,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const transactionSummary = getTransactionSummary(transaction, deserializeActionSummaries);
  if (!transactionSummary.ok) return transactionSummary;

  return result.ok({
    result: {
      status: 'Error',
      error: getConversionError(invalidTxError),
    },
    executedAt: {
      blockHash: transactionOutcome.blockHash.cryptoHash,
    },
    transactionSummary: transactionSummary.value,
    gasFee: yoctoNear(transactionOutcome.outcome.tokensBurnt),
    gasUsed: gas(transactionOutcome.outcome.gasBurnt),
  });
};
