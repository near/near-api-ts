import type {
  SendSignedTransactionDeserializeActionSummariesArgs,
  SendSignedTransactionDeserializeExecutionStepsArgs,
  SendSignedTransactionDeserializeResultDataArgs,
} from '../../../../../index';
import { createTestnetClient } from '../../../../../src/createClient/presets/testnet';
import type {
  ParsedTransactionActionSummary,
  RawTransactionActionSummary,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import type {
  ParsedExecutionStep,
  RawExecutionStep,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

// Awaited output of safeSendSignedTransaction is Result<SendSignedTransactionOutput<TPS>, ...>;
// pull the `processingStage` union off the `success: true` branch's `data`. Each extraction step
// distributes over a bare type parameter, so it correctly picks the `success: true` member out of the
// Result union instead of requiring the whole union to match.
type ExtractSuccessData<TResult> = TResult extends { success: true; data: infer D } ? D : never;
type SuccessData<TPromise> = ExtractSuccessData<Awaited<TPromise>>;

type ExtractProcessingStage<TValue> = TValue extends { processingStage: infer S } ? S : never;
type ProcessingStageOf<TPromise> = ExtractProcessingStage<SuccessData<TPromise>>;

// The same distribution over the stage members of the success data, for the deserialized parts.
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

// An execution failure is an error here, and its context carries the deserialized details too.
type ExtractError<TResult> = TResult extends { success: false; error: infer E } ? E : never;
type ExtractFailureSummaries<TError> = TError extends {
  context: { transactionDetails: infer T };
}
  ? ExtractSummaries<T>
  : never;
type FailureSummariesOf<TPromise> = ExtractFailureSummaries<ExtractError<Awaited<TPromise>>>;

const client = createTestnetClient();

const signedTransaction = {
  signedTransactionBorsh64: 'AA==',
  transactionHash: 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe',
};

// const withDefault = client.safeSendSignedTransaction({ signedTransactionBorsh64 });
// type _DefaultStage = Assert<
//   Equal<
//     ProcessingStageOf<typeof withDefault>,
//     'ExecutedOptimistic' | 'ExecutedNearlyFinal' | 'CompletedFinal'
//   >
// >;
// Test minimalProcessingStage

const g10 = client.safeSendSignedTransaction({
  signedTransaction,
});

const g31 = client.safeSendSignedTransaction<undefined>({
  signedTransaction,
});

// @ts-expect-error
const g50 = client.safeSendSignedTransaction<number>({
  signedTransaction,
});

// # ConvertedOptimistic

const CO10 = client.safeSendSignedTransaction({
  signedTransaction,
  minimalProcessingStage: 'ConvertedOptimistic',
});

const CO11 = client.safeSendSignedTransaction<'ConvertedOptimistic'>({
  signedTransaction,
  minimalProcessingStage: 'ConvertedOptimistic',
});

const minimalProcessingStageCO11 =
  2 > 1 ? ('ConvertedFinal' as const) : ('ExecutedOptimistic' as const);

const CO21 = await client.safeSendSignedTransaction<'ConvertedFinal' | 'ExecutedOptimistic'>({
  signedTransaction,
  minimalProcessingStage: minimalProcessingStageCO11,
});

if (CO21.success && CO21.data.processingStage) {
}

// ****

const CompletedFinal10 = await client.safeSendSignedTransaction({
  signedTransaction,
  minimalProcessingStage: 'CompletedFinal',
});
if (CompletedFinal10.success && CompletedFinal10.data.data) {
}

const CompletedFinal20 = await client.safeSendSignedTransaction({
  signedTransaction,
  minimalProcessingStage: 'CompletedFinal',
  options: {
    deserializeResultData: () => 1,
  },
});
if (CompletedFinal20.success && CompletedFinal20.data.data) {
}

// type _ConvertedOptimisticStage = Assert<
//   Equal<
//     ProcessingStageOf<typeof convertedOptimistic>,
//     | 'ConvertedOptimistic'
//     | 'ConvertedFinal'
//     | 'ExecutedOptimistic'
//     | 'ExecutedNearlyFinal'
//     | 'CompletedFinal'
//   >
// >;

// Inline deserializers with unannotated parameters
// -> each parameter gets its deserializer's input type; the output still follows ReturnType

const inline1 = client.safeSendSignedTransaction({
  signedTransaction,
  options: {
    deserializeResultData: (args) => {
      type _Inline1Args = Assert<
        Equal<typeof args, SendSignedTransactionDeserializeResultDataArgs>
      >;
      return args.rawData.length;
    },
  },
});
type _Inline1Stage = Assert<
  Equal<
    ProcessingStageOf<typeof inline1>,
    'ExecutedOptimistic' | 'ExecutedNearlyFinal' | 'CompletedFinal'
  >
>;
type _Inline1Data = Assert<Equal<DataOf<typeof inline1>, number>>;
type _Inline1Summaries = Assert<
  Equal<SummariesOf<typeof inline1>, ParsedTransactionActionSummary[]>
>;
type _Inline1ExecSteps = Assert<Equal<ExecStepsOf<typeof inline1>, ParsedExecutionStep[]>>;

const inline2 = client.safeSendSignedTransaction({
  signedTransaction,
  options: {
    deserializeActionSummaries: (args) => {
      type _Inline2Args = Assert<
        Equal<typeof args, SendSignedTransactionDeserializeActionSummariesArgs>
      >;
      return args.rawActionSummaries.map(({ actionType }) => actionType);
    },
  },
});
type _Inline2Data = Assert<Equal<DataOf<typeof inline2>, unknown>>;
type _Inline2Summaries = Assert<
  Equal<SummariesOf<typeof inline2>, RawTransactionActionSummary['actionType'][]>
>;
type _Inline2FailureSummaries = Assert<
  Equal<FailureSummariesOf<typeof inline2>, RawTransactionActionSummary['actionType'][]>
>;

const inline3 = client.safeSendSignedTransaction({
  signedTransaction,
  options: {
    deserializeExecutionSteps: (args) => {
      type _Inline3Args = Assert<
        Equal<typeof args, SendSignedTransactionDeserializeExecutionStepsArgs>
      >;
      return { stepsCount: args.rawExecutionSteps.length };
    },
  },
});
type _Inline3Data = Assert<Equal<DataOf<typeof inline3>, unknown>>;
type _Inline3ExecSteps = Assert<Equal<ExecStepsOf<typeof inline3>, { stepsCount: number }>>;

// All three inline next to minimalProcessingStage, which is still inferred
const inline4 = client.safeSendSignedTransaction({
  signedTransaction,
  minimalProcessingStage: 'CompletedFinal',
  options: {
    deserializeResultData: ({ rawData }) => rawData,
    deserializeActionSummaries: ({ rawActionSummaries }) => rawActionSummaries,
    deserializeExecutionSteps: ({ rawExecutionSteps }) => rawExecutionSteps,
  },
});
type _Inline4Stage = Assert<Equal<ProcessingStageOf<typeof inline4>, 'CompletedFinal'>>;
type _Inline4Data = Assert<Equal<DataOf<typeof inline4>, string>>;
type _Inline4Summaries = Assert<Equal<SummariesOf<typeof inline4>, RawTransactionActionSummary[]>>;
type _Inline4ExecSteps = Assert<Equal<ExecStepsOf<typeof inline4>, RawExecutionStep[]>>;

// Inline next to a named deserializer, through the throwing variant
const deserializeResultSize = (args: SendSignedTransactionDeserializeResultDataArgs) => ({
  size: args.rawData.length,
});
const inline5 = await client.sendSignedTransaction({
  signedTransaction,
  options: {
    deserializeResultData: deserializeResultSize,
    deserializeExecutionSteps: ({ rawExecutionSteps }) => rawExecutionSteps.length,
  },
});
type _Inline5Data = Assert<Equal<typeof inline5.data, { size: number }>>;
type _Inline5ExecSteps = Assert<Equal<typeof inline5.processingSteps.executionSteps, number>>;

client.safeSendSignedTransaction({
  signedTransaction,
  options: {
    // @ts-expect-error an inline deserializeActionSummaries receives { rawActionSummaries }, not { rawData }
    deserializeActionSummaries: ({ rawData }) => rawData,
  },
});

client.safeSendSignedTransaction<undefined, undefined>({
  signedTransaction,
  options: {
    // @ts-expect-error RDF pinned to undefined -> an inline deserializeResultData is poison-pilled
    deserializeResultData: ({ rawData }) => rawData,
  },
});
