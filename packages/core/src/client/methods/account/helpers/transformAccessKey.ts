import { throwableYoctoNear } from '../../../../helpers/tokens/nearToken';
import type { AccessKeyInfoView } from '@near-js/jsonrpc-types';
import type { AccountAccessKey, FunctionCallKey } from 'nat-types/_common/accountAccessKey';
import type { PublicKey } from 'nat-types/_common/crypto';

export const transformAccessKey = (key: AccessKeyInfoView): AccountAccessKey => {
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
    functionCallKey.gasBudget = throwableYoctoNear(allowance);
  }

  if (methodNames.length > 0) {
    functionCallKey.allowedFunctions = methodNames;
  }

  return functionCallKey;
};
