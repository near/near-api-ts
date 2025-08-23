import { getBlockTarget } from '../utils';
import { AccessKeyListSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type {
  CreateGetAccountKeys,
  Output,
} from 'nat-types/client/rpcMethods/accountKeys/getAccountKeys';
import type { AccountKey, FunctionCallKey } from 'nat-types/accountKey';
import type { PublicKey } from 'nat-types/crypto';
import type { AccessKeyInfoView } from '@near-js/jsonrpc-types';

const transformKey = (key: AccessKeyInfoView): AccountKey => {
  const publicKey = key.publicKey as PublicKey;
  const nonce = BigInt(key.accessKey.nonce);

  if (key.accessKey.permission === 'FullAccess')
    return {
      type: 'FullAccess',
      publicKey,
      nonce,
    };

  const { receiverId, methodNames, allowance } =
    key.accessKey.permission.FunctionCall;

  const functionCallKey = {
    type: 'FunctionCall',
    publicKey,
    nonce,
    restrictions: {
      contractAccountId: receiverId,
    },
  } as FunctionCallKey;

  if (typeof allowance === 'string') {
    functionCallKey.restrictions.gasBudget = {
      yoctoNear: BigInt(allowance),
    };
  }

  if (methodNames.length > 0) {
    functionCallKey.restrictions.allowedFunctions = methodNames;
  }

  return functionCallKey;
};

const responseTransformer = (result: unknown): Output => {
  const camelCased = snakeToCamelCase(result);
  const parsed = AccessKeyListSchema().parse(camelCased);

  return {
    blockHash: camelCased.blockHash,
    blockHeight: camelCased.blockHeight,
    accountKeys: parsed.keys.map(transformKey),
  };
};

export const createGetAccountKeys: CreateGetAccountKeys =
  ({ sendRequest }) =>
  ({ accountId, options }) =>
    sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_access_key_list',
          account_id: accountId,
          ...getBlockTarget(options),
        },
      },
      responseTransformer,
    });
