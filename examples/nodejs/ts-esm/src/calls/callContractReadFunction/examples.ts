import { createClient, testnet } from '@near-api-ts/core';
import * as z from 'zod/mini';

const contractAccountId = 'usdl.lantstool.testnet';
const functionName = 'ft_balance_of';

const client = createClient({ network: testnet });

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
type SerializeEmptyArgs = () => Uint8Array;

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

// OVERLOAD #2 - only deserializeResult

const knownResult21 = await client.callContractReadFunction({
  contractAccountId,
  functionName,
  options: { deserializeResult },
});

const knownResult22 =
  await client.callContractReadFunction<CustomDeserializeResult>({
    contractAccountId,
    functionName,
    options: { deserializeResult },
  });

// OVERLOAD #3 Json-like functionArgs + deserializeResult

const knownResult31 = await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
  options: { deserializeResult },
});

const knownResult32 = await client.callContractReadFunction<
  { a: number },
  CustomDeserializeResult
>({
  contractAccountId,
  functionName,
  functionArgs: { a: 1 },
  options: { deserializeResult },
});

// OVERLOAD #4

await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: undefined,
  options: {
    serializeArgs: serializeEmptyArgs,
  },
});

await client.callContractReadFunction<undefined, SerializeEmptyArgs>({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: serializeEmptyArgs,
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

await client.callContractReadFunction<{ b: bigint }, SerializeBigintArgs>({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
  },
});

const knownResult41 = await client.callContractReadFunction({
  contractAccountId,
  functionName,
  functionArgs: { b: 1n },
  options: {
    serializeArgs: serializeBigintArgs,
    deserializeResult,
  },
});

const knownResult42 = await client.callContractReadFunction<
  number[],
  (args: { functionArgs: number[] }) => Uint8Array,
  CustomDeserializeResult
>({
  contractAccountId,
  functionName,
  functionArgs: [1, 2, 3],
  options: {
    serializeArgs: (args) => Uint8Array.from(args.functionArgs),
    deserializeResult,
  },
});

const knownResult43 = await client.callContractReadFunction<
  undefined,
  SerializeEmptyArgs,
  CustomDeserializeResult
>({
  contractAccountId,
  functionName,
  options: {
    serializeArgs: serializeEmptyArgs,
    deserializeResult,
  },
});
