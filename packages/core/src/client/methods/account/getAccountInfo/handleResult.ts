import * as z from 'zod/mini';
import { AccountViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import type { RpcResponse } from '@common/schemas/zod/rpc';
import type { GetAccountInfoArgs } from 'nat-types/client/methods/account/getAccountInfo';
import { throwableYoctoNear } from '../../../../helpers/tokens/nearToken';
import { addTo } from '@common/utils/addTo';
import { result } from '@common/utils/result';
import { BlockHeightSchema } from '@common/schemas/zod/common/common';

const RpcQueryAccountViewResponseSchema = z.object({
  ...AccountViewSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: BlockHeightSchema,
});

export const handleResult = (
  rpcResponse: RpcResponse,
  args: GetAccountInfoArgs,
) => {
  const rpcResult = RpcQueryAccountViewResponseSchema.parse(rpcResponse.result);
  // storage_paid_at - deprecated since March 18, 2020:
  // https://github.com/near/nearcore/issues/2271

  const lockedBalance = throwableYoctoNear(rpcResult.locked);
  const totalBalance = throwableYoctoNear(rpcResult.amount).add(lockedBalance);

  const final = {
    blockHash: rpcResult.blockHash,
    blockHeight: rpcResult.blockHeight,
    accountId: args.accountId,
    accountInfo: {
      balance: {
        total: totalBalance,
        locked: lockedBalance,
      },
      usedStorageBytes: rpcResult.storageUsage,
    },
    rawRpcResponse: rpcResponse,
  };

  // TODO fix types - make sure .done() return a new proper type
  addTo(final.accountInfo)
    .field(
      'contractHash',
      rpcResult.codeHash,
      // When near account doesn't have a deployed contract on it,
      // it returns the placeholder instead of WASM hash
      (v) => v !== '11111111111111111111111111111111',
    )
    .field(
      'globalContractHash',
      rpcResult.globalContractHash,
      (v) => typeof v === 'string',
    )
    .field(
      'globalContractAccountId',
      rpcResult.globalContractAccountId,
      (v) => typeof v === 'string',
    );

  return result.ok(final);
};
