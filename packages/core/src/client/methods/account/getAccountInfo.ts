import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { AccountViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { throwableYoctoNear } from '../../../helpers/tokens/nearToken';
import { addTo } from '@common/utils/addTo';
import type {
  CreateSafeGetAccountInfo,
  GetAccountInfoArgs,
} from 'nat-types/client/methods/account/getAccountInfo';
import type { GeneralRpcResponse } from '@common/schemas/zod/rpc';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { result } from '@common/utils/result';

const RpcQueryAccountViewResponseSchema = z.object({
  ...AccountViewSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  rpcResponse: GeneralRpcResponse,
  args: GetAccountInfoArgs,
) => {
  const valid = RpcQueryAccountViewResponseSchema.parse(rpcResponse.result);
  // storage_paid_at - deprecated since March 18, 2020:
  // https://github.com/near/nearcore/issues/2271

  const lockedBalance = throwableYoctoNear(valid.locked);
  const totalBalance = throwableYoctoNear(valid.amount).add(lockedBalance);

  const final = {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    accountId: args.accountId,
    accountInfo: {
      balance: {
        total: totalBalance,
        locked: lockedBalance,
      },
      usedStorageBytes: valid.storageUsage,
    },
  };

  // TODO fix types - make sure .done() return a new proper type
  addTo(final.accountInfo)
    .field(
      'contractHash',
      valid.codeHash,
      // When near account doesn't have a deployed contract on it,
      // it returns the placeholder instead of WASM hash
      (v) => v !== '11111111111111111111111111111111',
    )
    .field(
      'globalContractHash',
      valid.globalContractHash,
      (v) => typeof v === 'string',
    )
    .field(
      'globalContractAccountId',
      valid.globalContractAccountId,
      (v) => typeof v === 'string',
    );

  return result.ok(final);
};

// NextFeature: Add ability to fetch detailed balance with 'available' field

export const createSafeGetAccountInfo: CreateSafeGetAccountInfo = (context) =>
  wrapUnknownError('Client.GetAccountInfo.Unknown', async (args) => {
    // TODO Validate input args

    const rpcResponse = await context.sendRequest({
      method: 'query',
      params: {
        request_type: 'view_account',
        account_id: args.accountId,
        ...toNativeBlockReference(args.atMomentOf),
      },
      transportPolicy: args.policies?.transport,
      signal: args.options?.signal,
    });

    if (!rpcResponse.ok) return rpcResponse;

    // TODO Handle rpcResponse.value.error

    return transformResult(rpcResponse.value, args);
  });
