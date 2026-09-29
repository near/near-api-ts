import type { AccessKeyView } from '@near-js/jsonrpc-types';
import type { AccountId } from '../../../../../../../../../../types/_common/common';
import type { PublicKey } from '../../../../../../../../../../types/_common/crypto';
import type { AddAccessKeyActionSummary } from '../../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import { yoctoNear } from '../../../../../../../../../_common/nearToken';

const toFunctionCallPermission = (receiverId: AccountId, methodNames: string[]) => ({
  kind: 'FunctionCall' as const,
  allowedContract: receiverId,
  allowedFunctions: methodNames.length > 0 ? methodNames : ('AllNonPayable' as const),
});

// Nearcore reports AddKey the same way inside a delegation and outside it. A gas key's balance and
// allowance are left out: nearcore adds such a key with an empty balance and no allowance, and
// rejects the action otherwise.
export const getRawAddAccessKeyActionSummary = ({
  publicKey,
  accessKey: { permission },
}: {
  publicKey: string;
  accessKey: AccessKeyView;
}): AddAccessKeyActionSummary => {
  const base = { actionType: 'AddAccessKey' as const, publicKey: publicKey as PublicKey };

  if (permission === 'FullAccess')
    return {
      ...base,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance' },
    };

  if ('FunctionCall' in permission) {
    const { allowance, methodNames, receiverId } = permission.FunctionCall;

    return {
      ...base,
      permission: toFunctionCallPermission(receiverId, methodNames),
      gasPayment: {
        source: 'AccountBalance',
        allowance: typeof allowance === 'string' ? yoctoNear(allowance) : 'Unlimited',
      },
    };
  }

  if ('GasKeyFullAccess' in permission)
    return {
      ...base,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'KeyBalance' },
      replayProtection: { totalSequences: permission.GasKeyFullAccess.numNonces },
    };

  if ('GasKeyFunctionCall' in permission) {
    const { receiverId, methodNames, numNonces } = permission.GasKeyFunctionCall;

    return {
      ...base,
      permission: toFunctionCallPermission(receiverId, methodNames),
      gasPayment: { source: 'KeyBalance' },
      replayProtection: { totalSequences: numNonces },
    };
  }

  throw new Error('Unsupported access key permission', { cause: permission });
};
