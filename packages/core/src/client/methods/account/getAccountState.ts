import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { AccountViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { yoctoNear } from '../../../helpers/near';
import type {
  CreateGetAccountState,
  GetAccountStateArgs,
  GetAccountStateResult,
} from 'nat-types/client/methods/account/getAccountState';

const RpcQueryAccountViewResponseSchema = z.object({
  ...AccountViewSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetAccountStateArgs,
): GetAccountStateResult => {
  const valid = RpcQueryAccountViewResponseSchema.parse(result);
  // storage_paid_at - deprecated since March 18, 2020: https://github.com/near/nearcore/issues/2271

  const lockedBalance = yoctoNear(valid.locked);
  const totalBalance = yoctoNear(valid.amount).add(lockedBalance);

  // When near account doesn't have a deployed contract on it,
  // it returns the placeholder instead
  const contractHash =
    valid.codeHash === '11111111111111111111111111111111'
      ? null
      : valid.codeHash;

  return {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    accountId: args.accountId,
    accountState: {
      balance: {
        total: totalBalance,
        locked: lockedBalance,
      },
      usedStorageBytes: valid.storageUsage,
      contractHash,
      globalContractHash: valid.globalContractHash ?? null,
      globalContractAccountId: valid.globalContractAccountId ?? null,
    },
  };
};

// TODO Add ability to fetch detailed balance with 'available' field
export const createGetAccountState: CreateGetAccountState =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      method: 'query',
      params: {
        request_type: 'view_account',
        account_id: args.accountId,
        ...toNativeBlockReference(args.atMomentOf),
      },
    });
    return transformResult(result, args);
  };
