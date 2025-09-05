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
const r12 = await client.callContractReadFunction<undefined, undefined>({
  contractAccountId,
  fnName,
});
// Error
await client.callContractReadFunction<Args>({
  contractAccountId: 'usdl.lantstool.testnet',
  fnName: 'ft_metadata',
});
// Error
await client.callContractReadFunction<Args>({
  contractAccountId: 'usdl.lantstool.testnet',
  fnName: 'ft_metadata',
  fnArgsBytes,
});
// Error
await client.callContractReadFunction<Args, typeof resultTransformer>({
  contractAccountId: 'usdl.lantstool.testnet',
  fnName: 'ft_metadata',
  fnArgsBytes,
});
// Error
await client.callContractReadFunction<typeof resultTransformer>({
  contractAccountId: 'usdl.lantstool.testnet',
  fnName: 'ft_metadata',
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
// Error - specify both generics, not only Args
// TODO Is it possible to take args from generic and infer resultTransformer from usage?
await client.callContractReadFunction<Args>({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
  resultTransformer,
});
// Error
await client.callContractReadFunction<undefined>({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
});
// Error
await client.callContractReadFunction<Args>({
  contractAccountId,
  fnName,
  fnArgsBytes,
});

/*************************************/

// 3. No args + Transform
// result:{ decimals: number }
const r31 = await client.callContractReadFunction({
  contractAccountId,
  fnName,
  resultTransformer,
});
// result:{ decimals: number }
const r32 = await client.callContractReadFunction<
  undefined,
  typeof resultTransformer
>({
  contractAccountId,
  fnName,
  resultTransformer,
});
// result:{ decimals: number }
const r33 = await client.callContractReadFunction<typeof resultTransformer>({
  contractAccountId,
  fnName,
  resultTransformer,
});
// Error - no fnArgsJson
await client.callContractReadFunction<Args, typeof resultTransformer>({
  contractAccountId,
  fnName,
  resultTransformer,
});
// Error - wrong resultTransformer type
await client.callContractReadFunction<typeof client>({
  contractAccountId,
  fnName,
  resultTransformer,
});
// Error - no resultTransformer
await client.callContractReadFunction<typeof resultTransformer>({
  contractAccountId,
  fnName,
});

/*************************************/

// 4. Args + Transform

// result:{ decimals: number }
const r41 = await client.callContractReadFunction({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
  resultTransformer,
});
// result:{ decimals: number }
const r42 = await client.callContractReadFunction<
  Args,
  typeof resultTransformer
>({
  contractAccountId,
  fnName,
  fnArgsJson: { account_id: 'lantstool.testnet' },
  resultTransformer,
});
// Error - no fnArgsJson and resultTransformer
await client.callContractReadFunction<Args, typeof resultTransformer>({
  contractAccountId,
  fnName,
});

/*************************************/

// 5. Contract Interface

const DataSchema = z.object({ nameFor: z.string() });

// type DataType = z.output<typeof DataSchema>;

const fnTransformer = (v: number[]) => {
  const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(v)));
  return DataSchema.parse(obj);
};

// type GetFtBalanceResult = {
//   fnArgs: { account_id: string };
//   transformFn: (v: number[]) => DataType;
// };

const getFtBalance = (args: { accountId: string }) => {
  return {
    contractAccountId,
    fnName,
    fnArgsJson: { account_id: args.accountId },
    resultTransformer: fnTransformer,
  };
};

// OK: result: { nameFor: string }
const r51 = await client.callContractReadFunction(getFtBalance({ accountId: '123' }));
// OK: result: { nameFor: string }
const r52 = await client.callContractReadFunction<
  { account_id: string },
  typeof fnTransformer
>(getFtBalance({ accountId: '123' }));
// Error - invalid args
await client.callContractReadFunction(getFtBalance({ invalid: '123' }));
