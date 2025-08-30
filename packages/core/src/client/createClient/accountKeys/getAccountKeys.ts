import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { RpcQueryResponseSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type {
  CreateGetAccountKeys,
  GetAccountKeysResult,
} from 'nat-types/client/accountKeys/getAccountKeys';
import type { AccountKey, FunctionCallKey } from 'nat-types/accountKey';
import type { PublicKey } from 'nat-types/crypto';
import type { AccessKeyInfoView } from '@near-js/jsonrpc-types';

const transformKey = (key: AccessKeyInfoView): AccountKey => {
  const publicKey = key.publicKey as PublicKey;
  const nonce = BigInt(key.accessKey.nonce);

  if (key.accessKey.permission === 'FullAccess')
    return {
      accessType: 'FullAccess',
      publicKey,
      nonce,
    };

  const { receiverId, methodNames, allowance } =
    key.accessKey.permission.FunctionCall;

  const functionCallKey = {
    accessType: 'FunctionCall',
    publicKey,
    nonce,
    contractAccountId: receiverId,
  } as FunctionCallKey;

  if (typeof allowance === 'string') {
    functionCallKey.gasBudget = {
      yoctoNear: BigInt(allowance),
    };
  }

  if (methodNames.length > 0) {
    functionCallKey.allowedFunctions = methodNames;
  }

  return functionCallKey;
};

const transformResult = (result: unknown): GetAccountKeysResult => {
  const camelCased = snakeToCamelCase(result);
  const parsed = RpcQueryResponseSchema().parse(camelCased);

  // TODO Remove this check once @near-js/jsonrpc-types will support a proper type
  if (!('keys' in parsed)) throw new Error('Invalid query response');

  return {
    blockHash: parsed.blockHash,
    blockHeight: BigInt(parsed.blockHeight),
    accountKeys: parsed.keys.map(transformKey),
  };
};

export const createGetAccountKeys: CreateGetAccountKeys =
  ({ sendRequest }) =>
  async (args) => {
    const result = sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_access_key_list',
          account_id: args.accountId,
          ...toNativeBlockReference(args.blockReference),
        },
      },
    });
    return transformResult(result);
  };
