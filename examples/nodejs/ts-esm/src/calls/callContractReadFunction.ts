import { createClient, testnet } from '@near-api-ts/core';
import * as z from 'zod/mini';

const client = createClient({ network: testnet });

type Args = {
  account_id: string;
};

type Result = {
  name: string;
  decimals1: number;
};

const responseZodSchema = z.object({
  name: z.string(),
  decimals: z.number(),
});

type Ret = z.output<typeof responseZodSchema>

const resultTransformer = (
  rawResult: number[],
): Ret  => {
  return responseZodSchema.parse(rawResult);
};

// const args = {
//   contractAccountId: 'usdl.lantstool.testnet',
//   fnName: 'ft_metadata',
//   fnArgsJson: {
//     account_id: 'lantstool.testnet',
//   },
//   responseTransformer,
// }

const result = await client.callContractReadFunction<Args>({
  contractAccountId: 'usdl.lantstool.testnet',
  fnName: 'ft_metadata',
  fnArgsJson: {
    account_id: 'lantstool.testnet',
  },
  resultTransformer,
});

console.log(result.result);

/*
const request = ftContractInterface.readFunctions.getFtBalance({
  contractAccountId: 'ft.near',
  fnArgs: { accountId: 'alice.near' },
});

const response = await client.callContractReadFunction(request);

-----------------

const storageDepositAction = ftContractInterface.writeFns.storageDeposit({
  fnArgs: { accountId: 'bob.near' },
  gasLimit: { teraGas: '10' },
  attachedDeposit: { near: '0.00125' },
});

const result = await signer.executeTransaction({
  action: ftTransferAction,
  receiverAccountId: 'ft-token.near',
});
 */
