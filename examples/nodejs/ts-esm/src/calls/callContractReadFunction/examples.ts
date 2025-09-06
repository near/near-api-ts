import { createClient, testnet } from '@near-api-ts/core';
import * as z from 'zod/mini';

const client = createClient({ network: testnet });

const contractAccountId = 'usdl.lantstool.testnet';
const fnName = 'ft_metadata';
const fnArgsBytes = new Uint8Array();

const responseZodSchema = z.object({ decimals: z.number() });
type ReturnResult = z.output<typeof responseZodSchema>;
const resultTransformer = (raw: number[]): ReturnResult =>
  responseZodSchema.parse(raw);

type Args = { account_id: string };
// Tests

/*************************************/

// 1. No Args + No Transform

// OK, result: unknown
const r11 = await client.callContractReadFunction({
  contractAccountId,
  fnName,
});
// OK, result: unknown
const r12 = await client.callContractReadFunction<undefined>({
  contractAccountId,
  fnName,
});
// OK, result: unknown
const r13 = await client.callContractReadFunction<undefined, undefined>({
  contractAccountId,
  fnName,
});
// Error - need to pass fnArgsJson
await client.callContractReadFunction<Args>({
  contractAccountId,
  fnName,
});
// Error - need to pass fnArgsJson
await client.callContractReadFunction<Args>({
  contractAccountId,
  fnName,
  fnArgsBytes,
});

/*************************************/

// 2. Args + No Transform

// OK: result: unknown
const r21 = await client.callContractReadFunction({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
});
// OK: result: unknown
const r22 = await client.callContractReadFunction<Args>({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
});
// OK: result: unknown
const r24 = await client.callContractReadFunction<undefined>({
  contractAccountId,
  fnName,
  fnArgsBytes,
});

// Error - fnArgsJson not allowed
await client.callContractReadFunction<undefined>({
  contractAccountId,
  fnName,
  fnArgsBytes,
  fnArgsJson: { account_id: 'lantstool.testnet' },
});
// Error - generic type doesn't extend MaybeJsonLikeValue
await client.callContractReadFunction<BigInt>({
  contractAccountId,
  fnName,
});

/*************************************/

// 3. No args + Transform
// result:{ decimals: number }
const r31 = await client.callContractReadFunction({
  contractAccountId,
  fnName,
  response: { resultTransformer },
});
// result:{ decimals: number }
const r32 = await client.callContractReadFunction<
  undefined,
  typeof resultTransformer
>({
  contractAccountId,
  fnName,
  fnArgsJson: undefined,
  response: { resultTransformer },
});

// Error - need to specify both generics
const r33 = await client.callContractReadFunction<typeof resultTransformer>({
  contractAccountId,
  fnName,
  response: { resultTransformer },
});
// Error - wrong resultTransformer type - has to extend BaseTransformFn
await client.callContractReadFunction<typeof client>({
  contractAccountId,
  fnName,
  response: { resultTransformer },
});
// Error - no resultTransformer found
await client.callContractReadFunction<undefined, typeof resultTransformer>({
  contractAccountId,
  fnName,
});
// Error - custom resultTransformer is not allowed without generic type
// when generic 'args' type is specified
await client.callContractReadFunction<undefined>({
  contractAccountId,
  fnName,
  response: { resultTransformer },
});

/*************************************/

// 4. Args + Transform

// result:{ decimals: number }
const r41 = await client.callContractReadFunction({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
  response: { resultTransformer },
});
// result:{ decimals: number }
const r42 = await client.callContractReadFunction<
  Args,
  typeof resultTransformer
>({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
  response: { resultTransformer },
});

// Error - no fnArgsJson and resultTransformer
await client.callContractReadFunction<Args, typeof resultTransformer>({
  contractAccountId,
  fnName,
});
// Error - resultTransformer isn't allowed (no generic type)
await client.callContractReadFunction<Args>({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
  response: { resultTransformer },
});

/*************************************/

// 5. Contract Interface

const DataSchema = z.object({ nameFor: z.string() });

const fnTransformer = (v: number[]) => {
  const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(v)));
  return DataSchema.parse(obj);
};

const getFtBalance = (args: { accountId: string }) => {
  return {
    contractAccountId,
    fnName,
    fnArgsJson: { account_id: args.accountId },
    response: { resultTransformer: fnTransformer },
  };
};

// OK: result: { nameFor: string }
const r51 = await client.callContractReadFunction(
  getFtBalance({ accountId: '123' }),
);
// OK: result: { nameFor: string }
const r52 = await client.callContractReadFunction<
  { account_id: string },
  typeof fnTransformer
>(getFtBalance({ accountId: '123' }));

// Error - invalid args
await client.callContractReadFunction(getFtBalance({ invalid: '123' }));
