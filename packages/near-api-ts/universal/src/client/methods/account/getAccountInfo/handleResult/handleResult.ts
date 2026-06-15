import { AccountViewSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import type { NearToken } from '../../../../../../types/_common/nearToken';
import type { GetAccountInfoArgs } from '../../../../../../types/client/methods/account/getAccountInfo';
import type { Prettify } from '../../../../../../types/utils';
import { createNatError, resultNatError } from '../../../../../_common/natError';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc/rpc';
import { result } from '../../../../../_common/utils/result';
import { calculateAccountBalance } from './calculateAccountBalance';

const RpcQueryViewAccountResultSchema = z.object({
  ...AccountViewSchema().shape,
  blockHash: z.string(),
  blockHeight: z.number(),
});

export type RpcQueryViewAccountResult = Prettify<z.infer<typeof RpcQueryViewAccountResultSchema>>;

export const handleResult = (
  rpcResponse: RpcResponse,
  storagePricePerByte: NearToken,
  args: GetAccountInfoArgs,
) => {
  const rpcResult = RpcQueryViewAccountResultSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetAccountInfo.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  const accountInfo = rpcResult.data;

  // storage_paid_at - deprecated since March 18, 2020:
  // https://github.com/near/nearcore/issues/2271

  // When near account doesn't have a deployed contract on it,
  // it returns the placeholder instead of WASM hash
  const contractWasmHash =
    accountInfo.codeHash !== '11111111111111111111111111111111' ? null : accountInfo.codeHash;

  return result.ok({
    accountId: args.accountId,
    balance: calculateAccountBalance(accountInfo, storagePricePerByte),
    usedStorageBytes: accountInfo.storageUsage,
    contractWasmHash,
    globalContractWasmHash: accountInfo.globalContractHash ?? null,
    globalContractAccountId: accountInfo.globalContractAccountId ?? null,
    atMomentOf: {
      blockHash: accountInfo.blockHash,
      blockHeight: accountInfo.blockHeight,
    },
  });
};
