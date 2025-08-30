import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { AccountViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { yoctoNear } from '../../../helpers/near';
import type {
  CreateGetAccountState,
  GetAccountStateArgs,
  GetAccountStateResult,
} from 'nat-types/client/account/getAccountState';

const RpcQueryAccountViewResponseSchema = z.object({
  ...AccountViewSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetAccountStateArgs,
): GetAccountStateResult => {
  const camelCased = snakeToCamelCase(result);
  const parsed = RpcQueryAccountViewResponseSchema.parse(camelCased);

  const final = {
    blockHash: parsed.blockHash,
    blockHeight: BigInt(parsed.blockHeight),
    accountId: args.accountId,
    accountState: {
      balance: {
        total: yoctoNear(parsed.amount),
        locked: yoctoNear(parsed.locked),
      },
      usedStorageBytes: parsed.storageUsage,
      contractWasmHash: parsed.codeHash,
    },
  } as GetAccountStateResult;

  if (parsed.globalContractAccountId)
    final.accountState.globalContractAccountId = parsed.globalContractAccountId;
  if (parsed.globalContractHash)
    final.accountState.globalContractHash = parsed.globalContractHash;

  return final;
};

export const createGetAccountState: CreateGetAccountState =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_account',
          account_id: args.accountId,
          ...toNativeBlockReference(args.blockReference),
        },
      },
    });
    return transformResult(result, args);
  };
