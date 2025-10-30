import { yoctoNear } from '../../../../helpers/nearToken';
import type { AccessKeyInfoView } from '@near-js/jsonrpc-types';
import type { AccountKey, FunctionCallKey } from 'nat-types/accountKey';
import type { PublicKey } from 'nat-types/crypto';

export const transformKey = (key: AccessKeyInfoView): AccountKey => {
  const publicKey = key.publicKey as PublicKey;
  const nonce = key.accessKey.nonce;

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
    functionCallKey.gasBudget = yoctoNear(allowance);
  }

  if (methodNames.length > 0) {
    functionCallKey.allowedFunctions = methodNames;
  }

  return functionCallKey;
};
