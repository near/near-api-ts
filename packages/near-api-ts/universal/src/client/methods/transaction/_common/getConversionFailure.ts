import type { InvalidTxError } from '@near-js/jsonrpc-types';
import { gas } from '../../../../../index';
import type { Result } from '../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionFailure } from '../../../../../types/_common/transactionDetails/conversionFailure';
import { type NatError } from '../../../../_common/natError';
import type { RpcTransactionOutcomeFailure } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../_common/utils/result';
import { yoctoNear } from '../../../../helpers/tokens/nearToken';
import { getTransactionSummary } from './_common/_common/getTransactionSummary';
import { getConversionFailureError } from './_common/getConversionFailureError';

type GetConversionFailureArgs = {
  transaction: RpcTransactionSummary;
  transactionOutcomeFailure: RpcTransactionOutcomeFailure;
  invalidTxError: InvalidTxError;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
};

type GetConversionFailureError =
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>;

const getBaseConversionFailure = (args: GetConversionFailureArgs) => {
  const { transaction, transactionOutcomeFailure, invalidTxError, deserializeActionSummaries } =
    args;

  const transactionSummary = getTransactionSummary(transaction, deserializeActionSummaries);
  if (!transactionSummary.ok) return transactionSummary;

  const error = getConversionFailureError(invalidTxError);

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    status: 'ConversionFailure' as const,
    error,
    processingSteps: {
      conversionStep: {
        result: {
          status: 'Failure' as const,
          error,
        },
        executedAt: {
          blockHash: transactionOutcomeFailure.blockHash.cryptoHash,
        },
        transactionSummary: transactionSummary.value,
        gasFee: yoctoNear(transactionOutcomeFailure.outcome.tokensBurnt),
        gasUsed: gas(transactionOutcomeFailure.outcome.gasBurnt),
      },
    },
  });
};

export const getConversionFailureExecutedOptimistic = (
  args: GetConversionFailureArgs,
): Result<ConversionFailure['ExecutedOptimistic'], GetConversionFailureError> => {
  const baseConversionFailure = getBaseConversionFailure(args);
  if (!baseConversionFailure.ok) return baseConversionFailure;

  return result.ok({
    processingStage: 'ExecutedOptimistic' as const,
    ...baseConversionFailure.value,
  });
};

export const getConversionFailureCompletedFinal = (
  args: GetConversionFailureArgs,
): Result<ConversionFailure['CompletedFinal'], GetConversionFailureError> => {
  const baseConversionFailure = getBaseConversionFailure(args);
  if (!baseConversionFailure.ok) return baseConversionFailure;

  return result.ok({
    processingStage: 'CompletedFinal' as const,
    ...baseConversionFailure.value,
  });
};
