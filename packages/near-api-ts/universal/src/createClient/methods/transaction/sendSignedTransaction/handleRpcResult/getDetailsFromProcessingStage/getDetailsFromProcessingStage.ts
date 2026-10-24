import type {
  Base64String,
  Result,
  TransactionHash,
} from '../../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ProtocolEra } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import type { TransactionProcessingStage } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/processingStage';
import type {
  ConversionFailureNatError,
  ExecutionFailureErrorAtStage,
} from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { TransactionDetailsFromStage } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { NatError } from '../../../../../../_common/_common/_common/_common/natError';
import { finalExecutionStatusToProcessingStage } from '../../../_common/processingStageConverters';
import type {
  RpcExecutedOptimisticTransactionDetails,
  RpcExecutedTransactionDetails,
  RpcFinalTransactionDetails,
  RpcIncludedFinalTransactionDetails,
  RpcIncludedTransactionDetails,
} from '../../../_common/zodSchemas/rpcTransactionDetails/rpcTransactionDetails';
import { getCompletedFinalDetails } from './getCompletedFinalDetails';
import { getConvertedFinalDetails } from './getConvertedFinalDetails';
import { getConvertedOptimisticDetails } from './getConvertedOptimisticDetails';
import { getExecutedNearlyFinalDetails } from './getExecutedNearlyFinalDetails';
import { getExecutedOptimisticDetails } from './getExecutedOptimisticDetails';

/**
 * The error union mixes inner errors (to be repacked by the calling method) with the already
 * public execution failures. `startsWith` alone doesn't narrow a union of literal kinds, so the
 * split lives here, next to the union it splits.
 */
type InnerTransactionDetailsError = Extract<
  TransactionDetailsError<'Live'>,
  { kind: `Inner.Client.TransactionDetails.${string}` }
>;

export const isInnerTransactionDetailsError = (
  error: TransactionDetailsError<'Live'>,
): error is InnerTransactionDetailsError =>
  error.kind.startsWith('Inner.Client.TransactionDetails');

export type InnerClientTransactionDetailsError =
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>;

export type TransactionDetailsError<PE extends ProtocolEra> =
  | InnerClientTransactionDetailsError
  | ConversionFailureNatError
  | ExecutionFailureErrorAtStage<'ExecutedOptimistic', PE>
  | ExecutionFailureErrorAtStage<'ExecutedNearlyFinal', PE>
  | ExecutionFailureErrorAtStage<'CompletedFinal', PE>;

// `PE` is the protocol eras the deserializers take data of: `'Live'` from the caller,
// `'Live' | 'Legacy'` in the builders - see `getDetailsFromProcessingStage`
type TransactionDetailsHandlerContext<PE extends ProtocolEra> = {
  rpcResult:
    | RpcIncludedTransactionDetails
    | RpcIncludedFinalTransactionDetails
    | RpcExecutedOptimisticTransactionDetails
    | RpcExecutedTransactionDetails
    | RpcFinalTransactionDetails;
  transactionHash: TransactionHash;
  signedTransactionBorsh64: Base64String;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn<PE>;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn<PE>;
};

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
  context: TransactionDetailsHandlerContext<'Live' | 'Legacy'>,
): Result<
  TransactionDetailsFromStage<'Live' | 'Legacy'>['ConvertedOptimistic'],
  TransactionDetailsError<'Live' | 'Legacy'>
> => {
  const { rpcResult, transactionHash } = context;

  switch (rpcResult.finalExecutionStatus) {
    case 'INCLUDED':
      return getConvertedOptimisticDetails(transactionHash);
    case 'INCLUDED_FINAL':
      return getConvertedFinalDetails({ ...context, rpcDetails: rpcResult });
    case 'EXECUTED_OPTIMISTIC':
      return getExecutedOptimisticDetails({ ...context, rpcDetails: rpcResult });
    case 'EXECUTED':
      return getExecutedNearlyFinalDetails({ ...context, rpcDetails: rpcResult });
    case 'FINAL':
      return getCompletedFinalDetails({ ...context, rpcDetails: rpcResult });
  }
};

/**
 * Builds the transaction details for any method, given the caller's minimal processing stage.
 * Different methods reuse this by simply constraining `S` to their supported subset of stages
 * (e.g. `submitSignedTransaction` would pass only `'ConvertedOptimistic' | 'ConvertedFinal'`); the
 * return type narrows to `TransactionDetailsFromStage[S]` automatically.
 */
export const getDetailsFromProcessingStage = <S extends TransactionProcessingStage>(
  context: TransactionDetailsHandlerContext<'Live'>,
  minimalProcessingStage: S,
): Result<TransactionDetailsFromStage<'Live'>[S], TransactionDetailsError<'Live'>> => {
  const actualProcessingStage = finalExecutionStatusToProcessingStage(
    context.rpcResult.finalExecutionStatus,
  );

  // The RPC was awaited with a `wait_until` matching `minimalProcessingStage`, so the actual stage must be
  // reachable from it. Anything else is a protocol-level surprise
  if (!reachableStagesByStage[minimalProcessingStage].includes(actualProcessingStage))
    throw new Error(
      `Unexpected stage "${actualProcessingStage}" for minimal stage "${minimalProcessingStage}"`,
    );

  // The builders the methods share read any transaction, so they take and produce details of every
  // era, while a transaction sent now holds only what the current protocol produces - `'Live'`.
  // `'Legacy'` adds nothing yet, so the two hold the same data - hence this cast.
  const details = buildDetails(context as TransactionDetailsHandlerContext<'Live' | 'Legacy'>);

  // The guard above guarantees the produced detail is a member of `TransactionDetailsFromStage[S]`,
  // but TS can't derive that from an `Array.includes` check — hence this single, contained cast.
  return details as Result<TransactionDetailsFromStage<'Live'>[S], TransactionDetailsError<'Live'>>;
};
