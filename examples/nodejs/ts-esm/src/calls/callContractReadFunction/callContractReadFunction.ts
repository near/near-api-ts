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

const resultTransformer = ({ rawResult }: { rawResult: number[] }) => {
  const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(rawResult)));
  return {
    parsedResult: FtMetadataSchema.parse(obj),
    rawResult,
  };
};

const response = await client.callContractReadFunction({
  contractAccountId: 'usdl.lantstool.testnet',
  fnName: 'ft_metadata',
  blockReference: {
    finality: 'Optimistic',
  },
  response: {
    resultTransformer,
  },
});

console.log(response.result.parsedResult);

// Generated from ABI by a future tool
const getFtBalance = (args: {
  contractAccountId: string;
  args: { accountId: string };
}) => {
  return {
    contractAccountId: args.contractAccountId,
    fnName: 'ft_metadata',
    fnArgsJson: {
      account_id: args.args.accountId,
    },
    response: { resultTransformer },
  };
};

const result2 = await client.callContractReadFunction(
  getFtBalance({
    contractAccountId: 'usdl.lantstool.testnet',
    args: { accountId: 'lantstool.testnet' },
  }),
);

console.log(result2.result.parsedResult);

// await client.callContractReadFunction({
//   contractAccountId: 'usdl.lantstool.testnet',
//   functionName: 'ft_metadata',
//   functionArgs: {
//     accountId: 'lantstool.testnet',
//   },
//   blockReference: {
//     finality: 'Optimistic',
//   },
//   options: {
//     serializeArgs,
//     deserializeResult,
//   },
// });

type HowRecent = 'LatestFinal' | 'LatestNearFinal' | string | number;

const a: HowRecent = 'LatestNearFinal';
