import { createClient, testnet } from '@near-api-ts/core';
import * as z from 'zod/mini';

const client = createClient({ network: testnet });
``
const toObject = (rawResult: number[]) =>
  JSON.parse(new TextDecoder().decode(new Uint8Array(rawResult)));

// Example 1

const FtMetadataSchema = z.object({
  spec: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  icon: z.nullish(z.string()),
  reference: z.nullish(z.string()),
  reference_hash: z.nullish(z.string()),
});

const deserializeMetadataResult = ({ rawResult }: { rawResult: number[] }) => ({
  metadata: FtMetadataSchema.parse(toObject(rawResult)),
  rawResult,
});

const fullResult = await client.callContractReadFunction({
  contractAccountId: 'usdl.lantstool.testnet',
  functionName: 'ft_metadata',
  withStateAt: 'LatestOptimisticBlock',
  options: {
    deserializeResult: deserializeMetadataResult,
  },
});

console.log(fullResult.result.metadata);

// Example 2 (with a generated-in-the-future-from-abi contract interface)

const ftBalanceOf = (args: {
  contractAccountId: string;
  args: { accountId: string };
}) => ({
  contractAccountId: args.contractAccountId,
  functionName: 'ft_balance_of',
  functionArgs: {
    account_id: args.args.accountId,
  },
  options: {
    deserializeResult: ({ rawResult }: { rawResult: number[] }) => ({
      // You can use any validator you like to check the real result
      units: toObject(rawResult) as string,
    }),
  },
});

const { result: ftBalance } = await client.callContractReadFunction(
  ftBalanceOf({
    contractAccountId: 'usdl.lantstool.testnet',
    args: { accountId: 'lantstool.testnet' },
  }),
);

console.log(ftBalance);
