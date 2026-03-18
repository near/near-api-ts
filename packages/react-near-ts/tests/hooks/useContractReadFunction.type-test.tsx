import * as z from 'zod/mini';
import { useContractReadFunction } from '../../src';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Assert<T extends true> = T;

type HookData<TQuery> = NonNullable<TQuery extends { data: infer TData } ? TData : never>;

type OutputResult<TQuery extends { data: { result: unknown } | undefined }> =
  HookData<TQuery>['result'];

const contractAccountId = 'usdl.lantstool.testnet';
const functionName = 'ft_balance_of';

const responseZodSchema = z.object({ decimals: z.number() });

const deserializeResult = (args: { rawResult: number[] }): { decimals: number } =>
  responseZodSchema.parse(args.rawResult);

type CustomDeserializeResult = (args: { rawResult: number[] }) => {
  decimals: number;
};

const serializeBigintArgs = (_args: { functionArgs: { b: bigint } }) => new Uint8Array(1);

type SerializeBigintArgs = (args: { functionArgs: { b: bigint } }) => Uint8Array;

const serializeEmptyArgs = () => new Uint8Array(1);
type SerializeEmptyArgs = (_args: { functionArgs?: never }) => Uint8Array;

// OVERLOAD #1 - only maybe Json-like functionArgs

const r10 = useContractReadFunction({
  contractAccountId,
  functionName,
});
type _T10 = Assert<Equal<OutputResult<typeof r10>, unknown>>;

const r11 = useContractReadFunction<undefined>({
  contractAccountId,
  functionName,
});
type _T11 = Assert<Equal<OutputResult<typeof r11>, unknown>>;

const r12 = useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: undefined,
});
type T12 = Assert<Equal<OutputResult<typeof r12>, unknown>>;

const r13 = useContractReadFunction<undefined>({
  contractAccountId,
  functionName,
  functionArgs: undefined,
});
type T13 = Assert<Equal<OutputResult<typeof r13>, unknown>>;

const r14 = useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
});
type T14 = Assert<Equal<OutputResult<typeof r14>, unknown>>;

const r15 = useContractReadFunction<{ a: number }>({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
});
type T15 = Assert<Equal<OutputResult<typeof r15>, unknown>>;

// OVERLOAD #2 - deserializeResult + maybe Json-like functionArgs

const knownResult20 = useContractReadFunction({
  contractAccountId,
  functionName,
  options: { deserializeResult },
});
type T20 = Assert<Equal<OutputResult<typeof knownResult20>, { decimals: number }>>;

const knownResult21 = useContractReadFunction<CustomDeserializeResult>({
  contractAccountId,
  functionName,
  options: { deserializeResult },
});
type T21 = Assert<Equal<OutputResult<typeof knownResult21>, { decimals: number }>>;

const knownResult22 = useContractReadFunction<CustomDeserializeResult, undefined>({
  contractAccountId,
  functionName,
  options: { deserializeResult },
});
type T22 = Assert<Equal<OutputResult<typeof knownResult22>, { decimals: number }>>;

const knownResult23 = useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
  options: { deserializeResult },
});
type T23 = Assert<Equal<OutputResult<typeof knownResult23>, { decimals: number }>>;

const knownResult24 = useContractReadFunction<
  (args: { rawResult: number[] }) => { decimals: number },
  { a: number }
>({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
  options: { deserializeResult },
});
type T24 = Assert<Equal<OutputResult<typeof knownResult24>, { decimals: number }>>;

// OVERLOAD #3 - custom serializeArgs

const r30 = useContractReadFunction({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: (_) => new Uint8Array(1),
  },
});
type T30 = Assert<Equal<OutputResult<typeof r30>, unknown>>;

const r31 = useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: undefined,
  options: {
    serializeArgs: () => new Uint8Array(1),
  },
});
type T31 = Assert<Equal<OutputResult<typeof r31>, unknown>>;

const r32 = useContractReadFunction<(args: { functionArgs: never }) => Uint8Array>({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: () => new Uint8Array(1),
  },
});
type T32 = Assert<Equal<OutputResult<typeof r32>, unknown>>;

const r33 = useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: undefined,
  options: {
    serializeArgs: (_args: { functionArgs?: never }) => new Uint8Array(1),
  },
});
type T33 = Assert<Equal<OutputResult<typeof r33>, unknown>>;

const r34 = useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
  },
});
type T34 = Assert<Equal<OutputResult<typeof r34>, unknown>>;

const r35 = useContractReadFunction<(args: { functionArgs: { b: bigint } }) => Uint8Array>({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
  },
});
type T35 = Assert<Equal<OutputResult<typeof r35>, unknown>>;

const r36 = useContractReadFunction<
  (args: { functionArgs: { b: bigint } }) => Uint8Array,
  undefined,
  { b: bigint }
>({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
  },
});
type T36 = Assert<Equal<OutputResult<typeof r36>, unknown>>;

const knownResult31 = useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
    deserializeResult,
  },
});
type TKnown31 = Assert<Equal<OutputResult<typeof knownResult31>, { decimals: number }>>;

const knownResult32 = useContractReadFunction<
  (args: { functionArgs: number[] }) => Uint8Array,
  CustomDeserializeResult,
  number[]
>({
  contractAccountId,
  functionName,
  functionArgs: [1, 2, 3],
  options: {
    serializeArgs: (args) => Uint8Array.from(args.functionArgs),
    deserializeResult,
  },
});
type TKnown32 = Assert<Equal<OutputResult<typeof knownResult32>, { decimals: number }>>;

const knownResult33 = useContractReadFunction<SerializeEmptyArgs, CustomDeserializeResult>({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: () => new Uint8Array(1),
    deserializeResult,
  },
});
type TKnown33 = Assert<Equal<OutputResult<typeof knownResult33>, { decimals: number }>>;

// Additional negative cases

// @ts-expect-error bigint is not Json-like for overload #1
useContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { bad: 1n },
});

// @ts-expect-error serializeArgs must return Uint8Array
useContractReadFunction({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: () => 1,
  },
});

useContractReadFunction({
  contractAccountId,
  functionName,
  options: {
    // @ts-expect-error deserializeResult arg must be { rawResult: number[] }
    deserializeResult: (_args: { rawResult: string }) => ({ decimals: 1 }),
  },
});

useContractReadFunction<SerializeBigintArgs>({
  contractAccountId,
  functionName,
  // @ts-expect-error functionArgs must match SerializeBigintArgs
  functionArgs: { b: '1' },
  options: {
    serializeArgs: serializeBigintArgs,
  },
});

useContractReadFunction<SerializeEmptyArgs>({
  contractAccountId,
  functionName,
  // @ts-expect-error functionArgs must be absent for SerializeEmptyArgs
  functionArgs: {},
  options: {
    serializeArgs: serializeEmptyArgs,
  },
});
