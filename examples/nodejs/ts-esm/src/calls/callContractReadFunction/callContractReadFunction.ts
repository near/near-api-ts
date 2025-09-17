import { createClient, testnet } from '@near-api-ts/core';
import * as z from 'zod/mini';

const client = createClient({ network: testnet });

const FtMetadataSchema = z.object({
  spec: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  icon: z.nullish(z.string()),
  reference: z.nullish(z.string()),
  reference_hash: z.nullish(z.string()),
});

const deserializeResult = ({ rawResult }: { rawResult: number[] }) => {
  const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(rawResult)));
  return {
    parsedResult: FtMetadataSchema.parse(obj),
    rawResult,
  };
};

const response = await client.callContractReadFunction({
  contractAccountId: 'usdl.lantstool.testnet',
  functionName: 'ft_metadata',
  withStateAt: 'LatestOptimisticBlock',
  options: {
    deserializeResult,
  },
});

console.log(response.result.parsedResult);

// Generated from ABI by a future tool
const getFtBalanceOf = (args: {
  contractAccountId: string;
  args: { accountId: string };
}) => {
  return {
    contractAccountId: args.contractAccountId,
    functionName: 'ft_balance_of',
    functionArgs: {
      account_id: args.args.accountId,
    },
    options: {
      deserializeResult,
    },
  };
};

const result2 = await client.callContractReadFunction(
  getFtBalanceOf({
    contractAccountId: 'usdl.lantstool.testnet',
    args: { accountId: 'lantstool.testnet' },
  }),
);

console.log(result2.result.parsedResult);
