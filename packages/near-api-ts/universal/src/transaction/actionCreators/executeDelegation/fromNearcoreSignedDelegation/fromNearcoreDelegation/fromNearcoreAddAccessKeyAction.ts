import type {
  AddAccessKeyAction,
  NearcoreAddAccessKeyAction,
  NearcoreFunctionCallPermission,
} from '../../../../../../types/_common/transaction/actions/delegableActions/addAccessKey';
import { fromNearcorePublicKey } from './_common/fromNearcorePublicKey';

const fromNearcoreFunctionCallPermission = ({
  receiverId,
  methodNames,
}: NearcoreFunctionCallPermission) => ({
  kind: 'FunctionCall' as const,
  allowedContract: receiverId,
  allowedFunctions: methodNames.length > 0 ? methodNames : ('AllNonPayable' as const),
});

// A gas key is added with an empty balance and no allowance - nearcore rejects anything else -
// so the action has no field for either. A delegation that carries them anyway loses them when
// re-encoded, and the node reports that as an invalid signature rather than its own error.
export const fromNearcoreAddAccessKeyAction = ({
  publicKey,
  accessKey: { permission },
}: NearcoreAddAccessKeyAction['addKey']): AddAccessKeyAction => {
  const base = { actionType: 'AddAccessKey' as const, publicKey: fromNearcorePublicKey(publicKey) };

  if ('fullAccess' in permission)
    return {
      ...base,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance' },
    };

  if ('functionCall' in permission) {
    const { allowance } = permission.functionCall;

    return {
      ...base,
      permission: fromNearcoreFunctionCallPermission(permission.functionCall),
      gasPayment: {
        source: 'AccountBalance',
        allowance: allowance === null ? 'Unlimited' : { yoctoNear: allowance },
      },
    };
  }

  if ('gasKeyFullAccess' in permission)
    return {
      ...base,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'KeyBalance' },
      replayProtection: { totalSequences: permission.gasKeyFullAccess.numNonces },
    };

  const { gasKeyInfo, functionCallPermission } = permission.gasKeyFunctionCall;

  return {
    ...base,
    permission: fromNearcoreFunctionCallPermission(functionCallPermission),
    gasPayment: { source: 'KeyBalance' },
    replayProtection: { totalSequences: gasKeyInfo.numNonces },
  };
};
