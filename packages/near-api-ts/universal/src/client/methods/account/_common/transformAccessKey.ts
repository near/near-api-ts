import type { AccessKeyInfoView } from '@near-js/jsonrpc-types';
import type { AccountAccessKey } from '../../../../../types/_common/accountAccessKey';
import type { PublicKey } from '../../../../../types/_common/crypto';
import { yoctoNear } from '../../../../helpers/tokens/nearToken';

export const transformAccessKey = (key: AccessKeyInfoView): AccountAccessKey => {
  const publicKey = key.publicKey as PublicKey;
  const nonce = key.accessKey.nonce;

  if (key.accessKey.permission === 'FullAccess')
    return {
      accessType: 'FullAccess',
      publicKey,
      nonce,
    };

  if ('FunctionCall' in key.accessKey.permission) {
    const { receiverId, methodNames, allowance } = key.accessKey.permission.FunctionCall;

    const gasBudget = typeof allowance === 'string' ? yoctoNear(allowance) : 'Unlimited';
    const allowedFunctions = methodNames.length > 0 ? methodNames : 'AllNonPayable';

    return {
      accessType: 'FunctionCall',
      publicKey,
      nonce,
      contractAccountId: receiverId,
      gasBudget,
      allowedFunctions,
    };
  }

  throw new Error('Unsupported access key permission', { cause: key });
};
