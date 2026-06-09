import type { ActionView } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { createTestnetClient } from '../../../../../src/client/presets/testnet';
import type { ActionSummary } from '../../../../../types/_common/transactionDetails/actionSummaries';
import type {
  DeserializeTransactionActionSummariesArgs,
  DeserializeTransactionResultDataArgs,
} from '../../../../../types/_common/transactionDetails/transactionResult';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

// Awaited output of getTransactionResult is a TransactionResult union of three members:
//   - Success -> result: { status: 'Success'; data }
//   - ConversionError -> result: { status: 'ConversionError'; error }
//   - ExecutionError -> result: { status: 'ExecutionError'; error }
// `data` lives only on the Success member; `actionSummaries` is shared by all members via
// processingSteps.conversionStep.transactionSummary.
type SuccessData<TPromise> =
  Awaited<TPromise> extends { result: infer R }
    ? Extract<R, { status: 'Success' }> extends { data: infer D }
      ? D
      : never
    : never;

type Summaries<TPromise> =
  Awaited<TPromise> extends {
    processingSteps: { conversionStep: { transactionSummary: { actionSummaries: infer S } } };
  }
    ? S
    : never;

// Fixtures

const responseZodSchema = z.object({ decimals: z.number() });

const deserializeResultData = (args: DeserializeTransactionResultDataArgs): { decimals: number } =>
  responseZodSchema.parse(args.data);
type CustomDeserializeResultData = (args: DeserializeTransactionResultDataArgs) => {
  decimals: number;
};

const deserializeActionSummaries = (
  _args: DeserializeTransactionActionSummariesArgs,
): [number, number, string] => [1, 2, '123'];
type CustomDeserializeActionSummaries = (
  args: DeserializeTransactionActionSummariesArgs,
) => [number, number, string];

// Pass-through summaries deserializer -> ReturnType is ActionView[]
const passthroughActionSummaries = (args: DeserializeTransactionActionSummariesArgs) =>
  args.rawActionSummaries;

const client = createTestnetClient();
const transactionHash = 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe';

// GROUP A - no deserializers (RD = undefined, AS = undefined)
// -> data: unknown, actionSummaries: ActionSummary[], `options` is omittable

const a1 = client.getTransactionResult({ transactionHash });
type _A1Data = Assert<Equal<SuccessData<typeof a1>, unknown>>;
type _A1Summaries = Assert<Equal<Summaries<typeof a1>, ActionSummary[]>>;

const a2 = client.getTransactionResult({ transactionHash, options: {} });
type _A2Data = Assert<Equal<SuccessData<typeof a2>, unknown>>;
type _A2Summaries = Assert<Equal<Summaries<typeof a2>, ActionSummary[]>>;

const a3 = client.getTransactionResult({
  transactionHash,
  options: { signal: new AbortController().signal },
});
type _A3Data = Assert<Equal<SuccessData<typeof a3>, unknown>>;
type _A3Summaries = Assert<Equal<Summaries<typeof a3>, ActionSummary[]>>;

const a4 = client.getTransactionResult({ transactionHash, policies: {} });
type _A4Data = Assert<Equal<SuccessData<typeof a4>, unknown>>;
type _A4Summaries = Assert<Equal<Summaries<typeof a4>, ActionSummary[]>>;

const a5 = client.getTransactionResult<undefined, undefined>({ transactionHash });
type _A5Data = Assert<Equal<SuccessData<typeof a5>, unknown>>;
type _A5Summaries = Assert<Equal<Summaries<typeof a5>, ActionSummary[]>>;

// GROUP B - only deserializeResultData (RD set, AS = undefined)
// -> data: ReturnType<RD>, actionSummaries: ActionSummary[]

const b1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData },
});
type _B1Data = Assert<Equal<SuccessData<typeof b1>, { decimals: number }>>;
type _B1Summaries = Assert<Equal<Summaries<typeof b1>, ActionSummary[]>>;

const b2 = client.getTransactionResult<CustomDeserializeResultData>({
  transactionHash,
  options: { deserializeResultData },
});
type _B2Data = Assert<Equal<SuccessData<typeof b2>, { decimals: number }>>;
type _B2Summaries = Assert<Equal<Summaries<typeof b2>, ActionSummary[]>>;

const b3 = client.getTransactionResult<CustomDeserializeResultData, undefined>({
  transactionHash,
  options: { deserializeResultData },
});
type _B3Data = Assert<Equal<SuccessData<typeof b3>, { decimals: number }>>;
type _B3Summaries = Assert<Equal<Summaries<typeof b3>, ActionSummary[]>>;

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
type _B4Data = Assert<Equal<SuccessData<typeof b4>, [bigint, string]>>;
type _B4Summaries = Assert<Equal<Summaries<typeof b4>, ActionSummary[]>>;

// GROUP C - only deserializeActionSummaries (RD = undefined, AS set)
// -> data: unknown, actionSummaries: ReturnType<AS>

const c1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeActionSummaries },
});
type _C1Data = Assert<Equal<SuccessData<typeof c1>, unknown>>;
type _C1Summaries = Assert<Equal<Summaries<typeof c1>, [number, number, string]>>;

const c2 = client.getTransactionResult<undefined, CustomDeserializeActionSummaries>({
  transactionHash,
  options: { deserializeActionSummaries },
});
type _C2Data = Assert<Equal<SuccessData<typeof c2>, unknown>>;
type _C2Summaries = Assert<Equal<Summaries<typeof c2>, [number, number, string]>>;

// Pass-through deserializer -> actionSummaries: ActionView[]
const c3 = client.getTransactionResult({
  transactionHash,
  options: { deserializeActionSummaries: passthroughActionSummaries },
});
type _C3Data = Assert<Equal<SuccessData<typeof c3>, unknown>>;
type _C3Summaries = Assert<Equal<Summaries<typeof c3>, ActionView[]>>;

// GROUP D - both deserializers (RD set, AS set)
// -> data: ReturnType<RD>, actionSummaries: ReturnType<AS>

const d1 = client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries },
});
type _D1Data = Assert<Equal<SuccessData<typeof d1>, { decimals: number }>>;
type _D1Summaries = Assert<Equal<Summaries<typeof d1>, [number, number, string]>>;

const d2 = client.getTransactionResult<
  CustomDeserializeResultData,
  CustomDeserializeActionSummaries
>({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries },
});
type _D2Data = Assert<Equal<SuccessData<typeof d2>, { decimals: number }>>;
type _D2Summaries = Assert<Equal<Summaries<typeof d2>, [number, number, string]>>;

// Narrowing sanity check - `data` is reachable only after narrowing on `status`, and the
// error members expose `error` instead of `data`.
const narrowed = await client.getTransactionResult({
  transactionHash,
  options: { deserializeResultData, deserializeActionSummaries },
});
if (narrowed.result.status === 'Success') {
  type _NarrowData = Assert<Equal<typeof narrowed.result.data, { decimals: number }>>;
} else {
  // ConversionError | ExecutionError both carry `error`, never `data`
  type _NarrowErrorKind = Assert<Equal<typeof narrowed.result.error.kind, unknown>>;
  type _NarrowErrorContext = Assert<Equal<typeof narrowed.result.error.context, unknown>>;
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
    // @ts-expect-error deserializeActionSummaries arg must be { rawActionSummaries: ActionView[] }
    deserializeActionSummaries: (_args: { rawActionSummaries: string }) => [],
  },
});

client.getTransactionResult<undefined, undefined>({
  transactionHash,
  options: {
    // @ts-expect-error RD pinned to undefined -> deserializeResultData is poison-pilled (never)
    deserializeResultData,
  },
});

client.getTransactionResult<CustomDeserializeResultData, undefined>({
  transactionHash,
  options: {
    deserializeResultData,
    // @ts-expect-error AS pinned to undefined -> deserializeActionSummaries is poison-pilled (never)
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
