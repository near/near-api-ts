import type { AccessKeyView } from '@near-js/jsonrpc-types';
import type { AccessKey, AllowedFunctions } from '../../../../../types/_common/accessKey';
import type { PublicKeyId } from '../../../../../types/_common/crypto';
import { yoctoNear } from '../../../../_common/nearToken';

type TransformAccessKeyArgs = {
  publicKeyId: PublicKeyId;
  accessKey: AccessKeyView;
};

const toAllowedFunctions = (methodNames: string[]): AllowedFunctions =>
  methodNames.length > 0 ? methodNames : 'AllNonPayable';

export const transformAccessKey = ({
  publicKeyId,
  accessKey,
}: TransformAccessKeyArgs): AccessKey => {
  const { nonce, permission } = accessKey;

  if (permission === 'FullAccess')
    return {
      publicKeyId,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
      replayProtection: { scheme: 'NonceChannel', lastNonce: nonce },
    };

  if ('FunctionCall' in permission) {
    const { receiverId, methodNames, allowance } = permission.FunctionCall;

    return {
      publicKeyId,
      permission: {
        kind: 'ContractFunctionCall',
        allowedContract: receiverId,
        allowedFunctions: toAllowedFunctions(methodNames),
      },
      gasPayment: {
        source: 'AccountBalance',
        allowance: typeof allowance === 'string' ? yoctoNear(allowance) : 'Unlimited',
      },
      replayProtection: { scheme: 'NonceChannel', lastNonce: nonce },
    };
  }

  // A gas key signs only through its own nonce channels, stored apart from the access key;
  // nearcore never checks the access key nonce for it
  if ('GasKeyFullAccess' in permission) {
    const { balance, numNonces } = permission.GasKeyFullAccess;

    return {
      publicKeyId,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'KeyBalance', balance: yoctoNear(balance) },
      replayProtection: { scheme: 'NonceChannels', channelCount: numNonces },
    };
  }

  if ('GasKeyFunctionCall' in permission) {
    // nearcore rejects an allowance on a gas key, so the view always carries null there
    const { receiverId, methodNames, balance, numNonces } = permission.GasKeyFunctionCall;

    return {
      publicKeyId,
      permission: {
        kind: 'ContractFunctionCall',
        allowedContract: receiverId,
        allowedFunctions: toAllowedFunctions(methodNames),
      },
      gasPayment: { source: 'KeyBalance', balance: yoctoNear(balance) },
      replayProtection: { scheme: 'NonceChannels', channelCount: numNonces },
    };
  }

  throw new Error('Unsupported access key permission', { cause: accessKey });
};
