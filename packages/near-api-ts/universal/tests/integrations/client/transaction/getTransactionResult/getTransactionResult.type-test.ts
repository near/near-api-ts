import * as z from 'zod/mini';
import { createTestnetClient } from '../../../../../src/createClient/presets/testnet';
import type {
  ParsedActionSummary,
  RawActionSummary,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import type { ConversionFailureKind } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/conversionFailureError';
import type {
  DeserializeTransactionActionSummariesArgs,
  DeserializeTransactionExecutionStepsArgs,
  DeserializeTransactionResultDataArgs,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailureKind } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import type {
  ParsedExecutionStep,
  RawExecutionStep,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

// Awaited output of getTransactionResult is a union of three members at the CompletedFinal stage,
// each carrying `status`, `data`/`error`, and `processingSteps` at the top level:
//   - ExecutionSuccess -> { status: 'ExecutionSuccess'; data }
//   - ConversionFailure -> { status: 'ConversionFailure'; error }
//   - ExecutionFailure -> { status: 'ExecutionFailure'; error }
// `data` lives only on the ExecutionSuccess member; `actionSummaries` is shared by all members via
// processingSteps.conversionStep.transactionSummary.
type ExecutionSuccessData<TPromise> =
  Extract<Awaited<TPromise>, { status: 'ExecutionSuccess' }> extends { data: infer D } ? D : never;

type Summaries<TPromise> =
  Awaited<TPromise> extends {
    processingSteps: { conversionStep: { transactionSummary: { actionSummaries: infer S } } };
  }
    ? S
    : never;

// `executionSteps` lives on the ExecutionSuccess and ExecutionFailure members; the
// ConversionFailure member carries neither `executionSteps` nor `refundSteps` (only
// `conversionStep`).
type MemberExecSteps<TMember> = TMember extends {
  processingSteps: { executionSteps: infer S };
}
  ? S
  : never;

type ExecSteps<TPromise> = MemberExecSteps<
  Extract<Awaited<TPromise>, { status: 'ExecutionSuccess' }>
>;

type ExecutionFailureExecSteps<TPromise> = MemberExecSteps<
  Extract<Awaited<TPromise>, { status: 'ExecutionFailure' }>
>;

// Keys present on the ConversionFailure member's processingSteps (expected: only 'conversionStep').
type ConversionFailureProcessingStepKeys<TPromise> =
  Extract<Awaited<TPromise>, { status: 'ConversionFailure' }> extends {
    processingSteps: infer P;
  }
    ? keyof P
    : never;

// Fixtures

const responseZodSchema = z.object({ decimals: z.number() });

const deserializeResultData = (args: DeserializeTransactionResultDataArgs): { decimals: number } =>
  responseZodSchema.parse(args.rawData);
type CustomDeserializeResultData = (args: DeserializeTransactionResultDataArgs) => {
  decimals: number;
};

const deserializeActionSummaries = (
  _args: DeserializeTransactionActionSummariesArgs,
): [number, number, string] => [1, 2, '123'];
type CustomDeserializeActionSummaries = (
  args: DeserializeTransactionActionSummariesArgs,
) => [number, number, string];

// Pass-through summaries deserializer -> ReturnType is RawActionSummary[]
const passthroughActionSummaries = (args: DeserializeTransactionActionSummariesArgs) =>
  args.rawActionSummaries;

const deserializeExecutionSteps = (
  args: DeserializeTransactionExecutionStepsArgs,
): {
  stepsCount: number;
} => ({ stepsCount: args.rawExecutionSteps.length });
type CustomDeserializeExecutionSteps = (args: DeserializeTransactionExecutionStepsArgs) => {
  stepsCount: number;
};

// Pass-through execution steps deserializer -> ReturnType is RawExecutionStep[]
const passthroughExecutionSteps = (args: DeserializeTransactionExecutionStepsArgs) =>
  args.rawExecutionSteps;

const client = createTestnetClient();
const transactionHash = 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe';

// GROUP A - no deserializers (RDF = undefined, ASF = undefined)
// -> data: unknown, actionSummaries: ParsedActionSummary[], `options` is omittable

const a1 = client.getTransactionResult({ transactionHash });
type _A1Data = Assert<Equal<ExecutionSuccessData<typeof a1>, unknown>>;
type _A1Summaries = Assert<Equal<Summaries<typeof a1>, ParsedActionSummary[]>>;
type _A1ExecSteps = Assert<Equal<ExecSteps<typeof a1>, ParsedExecutionStep[]>>;
type _A1ExecutionFailureExecSteps = Assert<
  Equal<ExecutionFailureExecSteps<typeof a1>, ParsedExecutionStep[]>
>;
type _A1ConversionFailureProcessingStepKeys = Assert<
  Equal<ConversionFailureProcessingStepKeys<typeof a1>, 'conversionStep'>
>;

const a2 = client.getTransactionResult({ transactionHash, options: {} });
type _A2Data = Assert<Equal<ExecutionSuccessData<typeof a2>, unknown>>;
type _A2Summaries = Assert<Equal<Summaries<typeof a2>, ParsedActionSummary[]>>;

const a3 = client.getTransactionResult({
  transactionHash,
  options: { signal: new AbortController().signal },
});
type _A3Data = Assert<Equal<ExecutionSuccessData<typeof a3>, unknown>>;
type _A3Summaries = Assert<Equal<Summaries<typeof a3>, ParsedActionSummary[]>>;

const a4 = client.getTransactionResult({ transactionHash, options: {} });
type _A4Data = Assert<Equal<ExecutionSuccessData<typeof a4>, unknown>>;
type _A4Summaries = Assert<Equal<Summaries<typeof a4>, ParsedActionSummary[]>>;

const a5 = client.getTransactionResult<undefined, undefined>({ transactionHash });
type _A5Data = Assert<Equal<ExecutionSuccessData<typeof a5>, unknown>>;
type _A5Summaries = Assert<Equal<Summaries<typeof a5>, ParsedActionSummary[]>>;

// GROUP B - only deserializeResultData (RDF set, ASF = undefined)
// -> data: ReturnType<RDF>, actionSummaries: ParsedActionSummary[]

const b1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData },
});
type _B1Data = Assert<Equal<ExecutionSuccessData<typeof b1>, { decimals: number }>>;
type _B1Summaries = Assert<Equal<Summaries<typeof b1>, ParsedActionSummary[]>>;

const b2 = client.getTransactionResult<CustomDeserializeResultData>({
  transactionHash,
  options: { deserializeResultData },
});
type _B2Data = Assert<Equal<ExecutionSuccessData<typeof b2>, { decimals: number }>>;
type _B2Summaries = Assert<Equal<Summaries<typeof b2>, ParsedActionSummary[]>>;

const b3 = client.getTransactionResult<CustomDeserializeResultData, undefined>({
  transactionHash,
  options: { deserializeResultData },
});
type _B3Data = Assert<Equal<ExecutionSuccessData<typeof b3>, { decimals: number }>>;
type _B3Summaries = Assert<Equal<Summaries<typeof b3>, ParsedActionSummary[]>>;

// Inline fn with a different return shape - proves ReturnType inference (not a hard-coded type)
const b4 = client.getTransactionResult({
  transactionHash,
  options: {
    deserializeResultData: (_args: DeserializeTransactionResultDataArgs): [bigint, string] => [
      1n,
      'abc',
    ],
  },
});
type _B4Data = Assert<Equal<ExecutionSuccessData<typeof b4>, [bigint, string]>>;
type _B4Summaries = Assert<Equal<Summaries<typeof b4>, ParsedActionSummary[]>>;

// GROUP C - only deserializeActionSummaries (RDF = undefined, ASF set)
// -> data: unknown, actionSummaries: ReturnType<ASF>

const c1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeActionSummaries },
});
type _C1Data = Assert<Equal<ExecutionSuccessData<typeof c1>, unknown>>;
type _C1Summaries = Assert<Equal<Summaries<typeof c1>, [number, number, string]>>;

const c2 = client.getTransactionResult<undefined, CustomDeserializeActionSummaries>({
  transactionHash,
  options: { deserializeActionSummaries },
});
type _C2Data = Assert<Equal<ExecutionSuccessData<typeof c2>, unknown>>;
type _C2Summaries = Assert<Equal<Summaries<typeof c2>, [number, number, string]>>;

// Pass-through deserializer -> actionSummaries: RawActionSummary[]
const c3 = client.getTransactionResult({
  transactionHash,
  options: { deserializeActionSummaries: passthroughActionSummaries },
});
type _C3Data = Assert<Equal<ExecutionSuccessData<typeof c3>, unknown>>;
type _C3Summaries = Assert<Equal<Summaries<typeof c3>, RawActionSummary[]>>;

// GROUP D - both deserializers (RDF set, ASF set)
// -> data: ReturnType<RDF>, actionSummaries: ReturnType<ASF>

const d1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries },
});
type _D1Data = Assert<Equal<ExecutionSuccessData<typeof d1>, { decimals: number }>>;
type _D1Summaries = Assert<Equal<Summaries<typeof d1>, [number, number, string]>>;

const d2 = client.getTransactionResult<
  CustomDeserializeResultData,
  CustomDeserializeActionSummaries
>({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries },
});
type _D2Data = Assert<Equal<ExecutionSuccessData<typeof d2>, { decimals: number }>>;
type _D2Summaries = Assert<Equal<Summaries<typeof d2>, [number, number, string]>>;

// GROUP E - only deserializeExecutionSteps (RDF = undefined, ASF = undefined, ESF set)
// -> data: unknown, actionSummaries: ParsedActionSummary[], executionSteps: ReturnType<ESF>

const e1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeExecutionSteps },
});
type _E1Data = Assert<Equal<ExecutionSuccessData<typeof e1>, unknown>>;
type _E1Summaries = Assert<Equal<Summaries<typeof e1>, ParsedActionSummary[]>>;
type _E1ExecSteps = Assert<Equal<ExecSteps<typeof e1>, { stepsCount: number }>>;
type _E1ExecutionFailureExecSteps = Assert<
  Equal<ExecutionFailureExecSteps<typeof e1>, { stepsCount: number }>
>;
type _E1ConversionFailureProcessingStepKeys = Assert<
  Equal<ConversionFailureProcessingStepKeys<typeof e1>, 'conversionStep'>
>;

const e2 = client.getTransactionResult<undefined, undefined, CustomDeserializeExecutionSteps>({
  transactionHash,
  options: { deserializeExecutionSteps },
});
type _E2Data = Assert<Equal<ExecutionSuccessData<typeof e2>, unknown>>;
type _E2Summaries = Assert<Equal<Summaries<typeof e2>, ParsedActionSummary[]>>;
type _E2ExecSteps = Assert<Equal<ExecSteps<typeof e2>, { stepsCount: number }>>;

// Pass-through deserializer -> executionSteps: RawExecutionStep[]
const e3 = client.getTransactionResult({
  transactionHash,
  options: { deserializeExecutionSteps: passthroughExecutionSteps },
});
type _E3Data = Assert<Equal<ExecutionSuccessData<typeof e3>, unknown>>;
type _E3ExecSteps = Assert<Equal<ExecSteps<typeof e3>, RawExecutionStep[]>>;

// GROUP F - combos with deserializeExecutionSteps

const f1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData, deserializeExecutionSteps },
});
type _F1Data = Assert<Equal<ExecutionSuccessData<typeof f1>, { decimals: number }>>;
type _F1Summaries = Assert<Equal<Summaries<typeof f1>, ParsedActionSummary[]>>;
type _F1ExecSteps = Assert<Equal<ExecSteps<typeof f1>, { stepsCount: number }>>;

const f2 = client.getTransactionResult({
  transactionHash,
  options: { deserializeActionSummaries, deserializeExecutionSteps },
});
type _F2Data = Assert<Equal<ExecutionSuccessData<typeof f2>, unknown>>;
type _F2Summaries = Assert<Equal<Summaries<typeof f2>, [number, number, string]>>;
type _F2ExecSteps = Assert<Equal<ExecSteps<typeof f2>, { stepsCount: number }>>;

const f3 = client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries, deserializeExecutionSteps },
});
type _F3Data = Assert<Equal<ExecutionSuccessData<typeof f3>, { decimals: number }>>;
type _F3Summaries = Assert<Equal<Summaries<typeof f3>, [number, number, string]>>;
type _F3ExecSteps = Assert<Equal<ExecSteps<typeof f3>, { stepsCount: number }>>;

const f4 = client.getTransactionResult<
  CustomDeserializeResultData,
  CustomDeserializeActionSummaries,
  CustomDeserializeExecutionSteps
>({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries, deserializeExecutionSteps },
});
type _F4Data = Assert<Equal<ExecutionSuccessData<typeof f4>, { decimals: number }>>;
type _F4Summaries = Assert<Equal<Summaries<typeof f4>, [number, number, string]>>;
type _F4ExecSteps = Assert<Equal<ExecSteps<typeof f4>, { stepsCount: number }>>;

// Both deserializers set, ESF omitted -> executionSteps stays default ParsedExecutionStep[]
const f5 = client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries },
});
type _F5ExecSteps = Assert<Equal<ExecSteps<typeof f5>, ParsedExecutionStep[]>>;

// Narrowing sanity check - `data` is reachable only after narrowing on `status`, and the
// error members expose `error` instead of `data`.
const narrowed = await client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries },
});
if (narrowed.status === 'ExecutionSuccess') {
  type _NarrowData = Assert<Equal<typeof narrowed.data, { decimals: number }>>;
} else {
  // ConversionFailure | ExecutionFailure both carry `error`, never `data`
  type _NarrowErrorKind = Assert<
    Equal<typeof narrowed.error.kind, ConversionFailureKind | ExecutionFailureKind>
  >;
}
type _NarrowSummaries = Assert<
  Equal<
    typeof narrowed.processingSteps.conversionStep.transactionSummary.actionSummaries,
    [number, number, string]
  >
>;

// Negative cases

client.getTransactionResult({
  transactionHash,
  options: {
    // @ts-expect-error deserializeResultData arg must be { data: Base64String }
    deserializeResultData: (_args: { data: number }) => ({ decimals: 1 }),
  },
});

client.getTransactionResult({
  transactionHash,
  options: {
    // @ts-expect-error deserializeActionSummaries arg must be { rawActionSummaries: RawActionSummary[] }
    deserializeActionSummaries: (_args: { rawActionSummaries: string }) => [],
  },
});

client.getTransactionResult<undefined, undefined>({
  transactionHash,
  options: {
    // @ts-expect-error RDF pinned to undefined -> deserializeResultData is poison-pilled (never)
    deserializeResultData,
  },
});

client.getTransactionResult<CustomDeserializeResultData, undefined>({
  transactionHash,
  options: {
    deserializeResultData,
    // @ts-expect-error ASF pinned to undefined -> deserializeActionSummaries is poison-pilled (never)
    deserializeActionSummaries,
  },
});

// @ts-expect-error transactionHash is required
client.getTransactionResult({ options: { deserializeResultData } });

client.getTransactionResult({
  transactionHash,
  // @ts-expect-error deserializeResultData belongs inside `options`, not at the top level
  deserializeResultData,
});

client.getTransactionResult({
  transactionHash,
  // @ts-expect-error signal must be an AbortSignal
  options: { signal: 'not-a-signal' },
});

client.getTransactionResult({
  transactionHash,
  options: {
    // @ts-expect-error deserializeExecutionSteps arg must be { rawExecutionSteps: RawExecutionStep[] }
    deserializeExecutionSteps: (_args: { rawExecutionSteps: string }) => [],
  },
});

client.getTransactionResult<undefined, undefined, undefined>({
  transactionHash,
  options: {
    // @ts-expect-error ESF pinned to undefined -> deserializeExecutionSteps is poison-pilled (never)
    deserializeExecutionSteps,
  },
});

client.getTransactionResult<
  CustomDeserializeResultData,
  CustomDeserializeActionSummaries,
  undefined
>({
  transactionHash,
  options: {
    deserializeResultData,
    deserializeActionSummaries,
    // @ts-expect-error ESF pinned to undefined -> deserializeExecutionSteps is poison-pilled (never)
    deserializeExecutionSteps,
  },
});

client.getTransactionResult({
  transactionHash,
  // @ts-expect-error deserializeExecutionSteps belongs inside `options`, not at the top level
  deserializeExecutionSteps,
});
