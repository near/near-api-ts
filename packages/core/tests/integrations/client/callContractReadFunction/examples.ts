import { createTestnetClient } from '../../../../src';
import * as z from 'zod/mini';

const contractAccountId = 'usdl.lantstool.testnet';
const functionName = 'ft_balance_of';

const client = await createTestnetClient();

/// ----------------
const responseZodSchema = z.object({ decimals: z.number() });

const deserializeResult = (args: {
  rawResult: number[];
}): z.output<typeof responseZodSchema> =>
  responseZodSchema.parse(args.rawResult);

type CustomDeserializeResult = (args: { rawResult: number[] }) => {
  decimals: number;
};

/// ----------------
const serializeBigintArgs = (_args: { functionArgs: { b: bigint } }) =>
  new Uint8Array(1);

type SerializeBigintArgs = (args: {
  functionArgs: { b: bigint };
}) => Uint8Array;

/// ----------------
const serializeEmptyArgs = () => new Uint8Array(1);
type SerializeEmptyArgs = (_args: { functionArgs?: never }) => Uint8Array;

// Examples

/*************************************/

// OVERLOAD #1 - only maybe Json-like functionArgs

await client.callContractReadFunction({
  contractAccountId,
  functionName,
});

await client.callContractReadFunction<undefined>({
  contractAccountId,
  functionName,
});

await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: undefined,
});

await client.callContractReadFunction<undefined>({
  contractAccountId,
  functionName,
  functionArgs: undefined,
});

await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
});

await client.callContractReadFunction<{ a: number }>({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
});

// OVERLOAD #2 - deserializeResult + maybe Json-like functionArgs

const knownResult20 = await client.callContractReadFunction({
  contractAccountId,
  functionName,
  options: { deserializeResult },
});

const knownResult21 =
  await client.callContractReadFunction<CustomDeserializeResult>({
    contractAccountId,
    functionName,
    options: { deserializeResult },
  });

const knownResult22 = await client.callContractReadFunction<
  CustomDeserializeResult,
  undefined
>({
  contractAccountId,
  functionName,
  options: { deserializeResult },
});

const knownResult23 = await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
  options: { deserializeResult },
});

const knownResult24 = await client.callContractReadFunction<
  (args: { rawResult: number[] }) => { decimals: number },
  { a: number }
>({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
  options: { deserializeResult },
});

// OVERLOAD #3

await client.callContractReadFunction({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: (_) => new Uint8Array(1),
  },
});

await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: undefined,
  options: {
    serializeArgs: () => new Uint8Array(1),
  },
});

await client.callContractReadFunction<
  (args: { functionArgs: never }) => Uint8Array
>({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: () => new Uint8Array(1),
  },
});

await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: undefined,
  options: {
    serializeArgs: (_args: { functionArgs?: never }) => new Uint8Array(1),
  },
});

await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
  },
});

await client.callContractReadFunction<
  (args: { functionArgs: { b: bigint } }) => Uint8Array
>({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
  },
});

await client.callContractReadFunction<
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

const knownResult31 = await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
    deserializeResult,
  },
});

const knownResult32 = await client.callContractReadFunction<
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

const knownResult33 = await client.callContractReadFunction<
  SerializeEmptyArgs,
  CustomDeserializeResult
>({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: () => new Uint8Array(1),
    deserializeResult,
  },
});
