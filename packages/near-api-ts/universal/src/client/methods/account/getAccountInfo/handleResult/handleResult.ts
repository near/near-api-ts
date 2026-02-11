import * as z from 'zod/mini';
import { AccountViewSchema } from '@near-js/jsonrpc-types';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc';
import type {
  GetAccountInfoArgs,
  GetAccountInfoOutput,
} from '../../../../../../types/client/methods/account/getAccountInfo';
import { result } from '../../../../../_common/utils/result';
import { createNatError } from '../../../../../_common/natError';
import type { NearToken } from '../../../../../../types/_common/nearToken';
import { calculateAccountBalance } from './calculateAccountBalance';

const RpcQueryViewAccountResultSchema = z.object({
  ...AccountViewSchema().shape,
  blockHash: z.string(),
  blockHeight: z.number(),
});

export type RpcQueryViewAccountResult = z.infer<
  typeof RpcQueryViewAccountResultSchema
>;

export const handleResult = (
  rpcResponse: RpcResponse,
  storagePricePerByte: NearToken,
  args: GetAccountInfoArgs,
) => {
  const rpcResult = RpcQueryViewAccountResultSchema.safeParse(
    rpcResponse.result,
  );

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.GetAccountInfo.SendRequest.Failed',
        context: {
          cause: createNatError({
            kind: 'Client.Transport.SendRequest.Response.Result.InvalidSchema',
            context: { zodError: rpcResult.error },
          }),
        },
      }),
    );

  const accountInfo = rpcResult.data;

  const output: GetAccountInfoOutput = {
    blockHash: accountInfo.blockHash,
    blockHeight: accountInfo.blockHeight,
    accountId: args.accountId,
    accountInfo: {
      balance: calculateAccountBalance(accountInfo, storagePricePerByte),
      usedStorageBytes: accountInfo.storageUsage,
    },
    rawRpcResult: accountInfo,
  };

  // When near account doesn't have a deployed contract on it,
  // it returns the placeholder instead of WASM hash
  if (accountInfo.codeHash !== '11111111111111111111111111111111') {
    output.accountInfo.contractHash = accountInfo.codeHash;
  }

  if (typeof accountInfo.globalContractHash === 'string') {
    output.accountInfo.globalContractHash = accountInfo.globalContractHash;
  }

  if (typeof accountInfo.globalContractAccountId === 'string') {
    output.accountInfo.globalContractAccountId =
      accountInfo.globalContractAccountId;
  }

  // storage_paid_at - deprecated since March 18, 2020:
  // https://github.com/near/nearcore/issues/2271

  return result.ok(output);
};
