import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { AccountViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { yoctoNear } from '../../../helpers/near';
import { addTo } from '@common/utils/addTo';
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

  const final = {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    accountId: args.accountId,
    accountState: {
      balance: {
        total: totalBalance,
        locked: lockedBalance,
      },
      usedStorageBytes: valid.storageUsage,
    },
  };
  // TODO fix types - make sure .done() return a new proper type
  addTo(final.accountState)
    .field(
      'contractHash',
      valid.codeHash,
      // When near account doesn't have a deployed contract on it,
      // it returns the placeholder instead
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

  return final;
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
