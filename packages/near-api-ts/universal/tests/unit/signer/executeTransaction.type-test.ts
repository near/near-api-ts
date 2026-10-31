import type { SendSignedTransactionDeserializeResultDataArgs, Signer } from '../../../index';
import { transfer } from '../../../index';
import type {
  ParsedTransactionActionSummary,
  RawTransactionActionSummary,
} from '../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import type { RawExecutionStep } from '../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

// Each step distributes over the Result and over the stages in it, as in the
// sendSignedTransaction type test
type ExtractSuccessData<TResult> = TResult extends { success: true; data: infer D } ? D : never;
type SuccessData<TPromise> = ExtractSuccessData<Awaited<TPromise>>;

type ExtractProcessingStage<TValue> = TValue extends { processingStage: infer S } ? S : never;
type ProcessingStageOf<TPromise> = ExtractProcessingStage<SuccessData<TPromise>>;

type ExtractData<TValue> = TValue extends { data: infer D } ? D : never;
type DataOf<TPromise> = ExtractData<SuccessData<TPromise>>;

type ExtractSummaries<TValue> = TValue extends {
  processingSteps: { conversionStep: { transactionSummary: { actionSummaries: infer S } } };
}
  ? S
  : never;
type SummariesOf<TPromise> = ExtractSummaries<SuccessData<TPromise>>;

type ExtractExecSteps<TValue> = TValue extends { processingSteps: { executionSteps: infer S } }
  ? S
  : never;
type ExecStepsOf<TPromise> = ExtractExecSteps<SuccessData<TPromise>>;

type ExtractError<TResult> = TResult extends { success: false; error: infer E } ? E : never;
type ExtractFailureSummaries<TError> = TError extends {
  context: { transactionDetails: infer T };
}
  ? ExtractSummaries<T>
  : never;
type FailureSummariesOf<TPromise> = ExtractFailureSummaries<ExtractError<Awaited<TPromise>>>;

declare const signer: Signer;

const intent = {
  action: transfer({ amount: { yoctoNear: '1' } }),
  receiverAccountId: 'nat',
};

// Only an intent - the details of the default stage, as sendSignedTransaction gives them
const plain = signer.safeExecuteTransaction({ intent });
type _PlainStage = Expect<
  Equal<
    ProcessingStageOf<typeof plain>,
    'ExecutedOptimistic' | 'ExecutedNearlyFinal' | 'CompletedFinal'
  >
>;
type _PlainSummaries = Expect<
  Equal<SummariesOf<typeof plain>, ParsedTransactionActionSummary<'Live'>[]>
>;

// The minimal stage is inferred
const converted = signer.safeExecuteTransaction({
  intent,
  minimalProcessingStage: 'ConvertedOptimistic',
});
type _ConvertedStage = Expect<
  Equal<
    ProcessingStageOf<typeof converted>,
    | 'ConvertedOptimistic'
    | 'ConvertedFinal'
    | 'ExecutedOptimistic'
    | 'ExecutedNearlyFinal'
    | 'CompletedFinal'
  >
>;

// Inline deserializers get their parameters typed, and the details follow what they return -
// those of an execution failure too
const inline = signer.safeExecuteTransaction({
  intent,
  minimalProcessingStage: 'CompletedFinal',
  options: {
    deserializeResultData: (args) => {
      type _Args = Expect<Equal<typeof args, SendSignedTransactionDeserializeResultDataArgs>>;
      return args.rawData.length;
    },
    deserializeActionSummaries: ({ rawActionSummaries }) =>
      rawActionSummaries.map(({ actionType }) => actionType),
    deserializeExecutionSteps: ({ rawExecutionSteps }) => rawExecutionSteps,
  },
});
type _InlineStage = Expect<Equal<ProcessingStageOf<typeof inline>, 'CompletedFinal'>>;
type _InlineData = Expect<Equal<DataOf<typeof inline>, number>>;
type _InlineSummaries = Expect<
  Equal<SummariesOf<typeof inline>, RawTransactionActionSummary<'Live'>['actionType'][]>
>;
type _InlineExecSteps = Expect<Equal<ExecStepsOf<typeof inline>, RawExecutionStep<'Live'>[]>>;
type _InlineFailureSummaries = Expect<
  Equal<FailureSummariesOf<typeof inline>, RawTransactionActionSummary<'Live'>['actionType'][]>
>;

// A named deserializer next to the other options, through the throwing variant
const deserializeResultSize = (args: SendSignedTransactionDeserializeResultDataArgs) => ({
  size: args.rawData.length,
});
const named = await signer.executeTransaction({
  intent,
  options: {
    transportPolicy: { rpcTypePreferences: ['Regular'] },
    signal: AbortSignal.timeout(1000),
    deserializeResultData: deserializeResultSize,
  },
});
type _NamedData = Expect<Equal<typeof named.data, { size: number }>>;

signer.safeExecuteTransaction({
  intent,
  options: {
    // @ts-expect-error an inline deserializeActionSummaries receives { rawActionSummaries }, not { rawData }
    deserializeActionSummaries: ({ rawData }) => rawData,
  },
});

signer.safeExecuteTransaction<undefined, undefined>({
  intent,
  options: {
    // @ts-expect-error RDF pinned to undefined -> an inline deserializeResultData is poison-pilled
    deserializeResultData: ({ rawData }) => rawData,
  },
});

// @ts-expect-error not a processing stage
signer.safeExecuteTransaction({ intent, minimalProcessingStage: 'Sent' });
