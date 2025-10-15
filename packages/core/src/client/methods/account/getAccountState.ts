import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { AccountViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { yoctoNear } from '../../../helpers/near';
import type {
  CreateGetAccountState,
  GetAccountStateArgs,
  GetAccountStateResult,
} from 'nat-types/client/methods/account/getAccountState';
import type {SendRequest} from 'nat-types/client/client';

const RpcQueryAccountViewResponseSchema = z.object({
  ...AccountViewSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetAccountStateArgs,
): GetAccountStateResult => {
  // remove snakeToCamelCase - we do it on the sendRequest level
  // const camelCased = snakeToCamelCase(result);

  const valid = RpcQueryAccountViewResponseSchema.parse(result);

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
      contractWasmHash: valid.codeHash,
    },
  } as GetAccountStateResult;

  if (valid.globalContractAccountId)
    final.accountState.globalContractAccountId = valid.globalContractAccountId;
  if (valid.globalContractHash)
    final.accountState.globalContractHash = valid.globalContractHash;

  return final;
};

// TODO Add ability to fetch detailed balance with 'available' field
export const createGetAccountState: CreateGetAccountState =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      // TODO remove body
      body: {
        method: 'query',
        params: {
          request_type: 'view_account',
          account_id: args.accountId,
          ...toNativeBlockReference(args.atMomentOf),
        },
      },
    });
    return transformResult(result, args);
  };
