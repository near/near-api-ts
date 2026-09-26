import type { AccessKeyView } from '@near-js/jsonrpc-types';
import type { AccountAccessKey } from '../../../../../types/_common/accountAccessKey';
import type { PublicKeyRef } from '../../../../../types/_common/crypto';
import { yoctoNear } from '../../../../_common/nearToken';

type TransformAccessKeyArgs = {
  publicKeyRef: PublicKeyRef;
  accessKey: AccessKeyView;
};

export const transformAccessKey = ({
  publicKeyRef,
  accessKey,
}: TransformAccessKeyArgs): AccountAccessKey => {
  const { nonce, permission } = accessKey;

  if (permission === 'FullAccess')
    return {
      accessType: 'FullAccess',
      publicKeyRef,
      nonce,
    };

  if ('FunctionCall' in permission) {
    const { receiverId, methodNames, allowance } = permission.FunctionCall;

    const gasBudget = typeof allowance === 'string' ? yoctoNear(allowance) : 'Unlimited';
    const allowedFunctions = methodNames.length > 0 ? methodNames : 'AllNonPayable';

    return {
      accessType: 'FunctionCall',
      publicKeyRef,
      nonce,
      contractAccountId: receiverId,
      gasBudget,
      allowedFunctions,
    };
  }

  throw new Error('Unsupported access key permission', { cause: accessKey });
};
