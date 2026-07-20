import type { Result } from '../../../../../../types/_common/common';
import type { TransactionProcessingStage } from '../../../../../../types/_common/transactionDetails/processingStage';
import type { TransactionDetailsFromStage } from '../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { NatError } from '../../../../../_common/natError';
import { finalExecutionStatusToProcessingStage } from '../../../../../_common/transformers/fromNative/processingStage';
import type { TransactionDetailsHandlerContext } from '../../sendSignedTransaction/handleRpcResult/handleRpcResult';
import { getCompletedFinalDetails } from './getCompletedFinalDetails';
import { getConvertedFinalDetails } from './getConvertedFinalDetails';
import { getConvertedOptimisticDetails } from './getConvertedOptimisticDetails';
import { getExecutedNearlyFinalDetails } from './getExecutedNearlyFinalDetails';
import { getExecutedOptimisticDetails } from './getExecutedOptimisticDetails';

type TransactionDetailsError =
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>;

/**
 * Which stages are reachable at/after a given minimal stage — the runtime twin of the type-level
 * `ReachableStageFromStage` in `output.ts`. Since the RPC is awaited with a `wait_until` matching
 * the requested minimal stage, the actual stage must belong to this set; anything else is a
 * protocol-level surprise. The `Converted*` and `Executed*` mid-flows are disjoint, so this is not
 * a plain suffix of a single ordering.
 */
const reachableStagesByStage: Record<TransactionProcessingStage, TransactionProcessingStage[]> = {
  ConvertedOptimistic: [
    'ConvertedOptimistic',
    'ConvertedFinal',
    'ExecutedOptimistic',
    'ExecutedNearlyFinal',
    'CompletedFinal',
  ],
  ConvertedFinal: ['ConvertedFinal', 'ExecutedNearlyFinal', 'CompletedFinal'],
  ExecutedOptimistic: ['ExecutedOptimistic', 'ExecutedNearlyFinal', 'CompletedFinal'],
  ExecutedNearlyFinal: ['ExecutedNearlyFinal', 'CompletedFinal'],
  CompletedFinal: ['CompletedFinal'],
};

/**
 * Canonical cascade: the raw RPC `finalExecutionStatus` selects the matching detail builder. This
 * is the only place (besides `finalExecutionStatusToProcessingStage`) where nearcore status names
 * appear — the `switch` is required to narrow `rpcResult` down to the specific `Rpc*Details` shape
 * each builder expects, which happens here without any cast.
 *
 * The return type is the widest reachable union (everything reachable from `ConvertedOptimistic`).
 */
const buildDetails = (
  context: TransactionDetailsHandlerContext,
): Result<TransactionDetailsFromStage['ConvertedOptimistic'], TransactionDetailsError> => {
  const { rpcResult } = context;

  if (rpcResult.finalExecutionStatus === 'INCLUDED') return getConvertedOptimisticDetails(context);

  if (rpcResult.finalExecutionStatus === 'INCLUDED_FINAL')
    return getConvertedFinalDetails({ ...context, rpcDetails: rpcResult });

  if (rpcResult.finalExecutionStatus === 'EXECUTED_OPTIMISTIC')
    return getExecutedOptimisticDetails({ ...context, rpcDetails: rpcResult });

  if (rpcResult.finalExecutionStatus === 'EXECUTED')
    return getExecutedNearlyFinalDetails({ ...context, rpcDetails: rpcResult });

  if (rpcResult.finalExecutionStatus === 'FINAL')
    return getCompletedFinalDetails({ ...context, rpcDetails: rpcResult });

  throw new Error(`Unexpected rpcResult: ${JSON.stringify(rpcResult)}`);
};

/**
 * Builds the transaction details for any method, given the caller's minimal processing stage.
 * Different methods reuse this by simply constraining `S` to their supported subset of stages
 * (e.g. `submitSignedTransaction` would pass only `'ConvertedOptimistic' | 'ConvertedFinal'`); the
 * return type narrows to `TransactionDetailsFromStage[S]` automatically.
 */
export const getDetailsFromProcessingStage = <S extends TransactionProcessingStage>(
  context: TransactionDetailsHandlerContext,
  minimalStage: S,
): Result<TransactionDetailsFromStage[S], TransactionDetailsError> => {
  // Convert at the boundary — from here on we only deal with our own stage names.
  const actualStage = finalExecutionStatusToProcessingStage(context.rpcResult.finalExecutionStatus);

  // The RPC was awaited with a `wait_until` matching `minimalStage`, so the actual stage must be
  // reachable from it. Anything else is a protocol-level surprise — fail loudly rather than return
  // details for a stage the caller's type doesn't promise.
  if (!reachableStagesByStage[minimalStage].includes(actualStage))
    throw new Error(`Unexpected stage "${actualStage}" for minimal stage "${minimalStage}"`);

  // The guard above guarantees the produced detail is a member of `TransactionDetailsFromStage[S]`,
  // but TS can't derive that from an `Array.includes` check — hence this single, contained cast.
  return buildDetails(context) as Result<TransactionDetailsFromStage[S], TransactionDetailsError>;
};
