import type {
  AddKeyAction,
  NativeAddKeyAction,
} from 'nat-types/actions/addKey';
import { toNativePublicKey } from '@common/transformers/toNative/publicKey';

const getPermission = (
  params: AddKeyAction['params'],
): NativeAddKeyAction['addKey']['accessKey']['permission'] => {
  if (params.type === 'FullAccess') return { fullAccess: {} };

  const { contractAccountId, gasBudget, allowedFunctions } =
    params.restrictions;

  return {
    functionCall: {
      receiverId: contractAccountId,
      allowance: gasBudget?.yoctoNear,
      methodNames: allowedFunctions ?? [],
    },
  };
};

export const toNativeAddKeyAction = (
  action: AddKeyAction,
): NativeAddKeyAction => ({
  addKey: {
    publicKey: toNativePublicKey(action.params.publicKey),
    accessKey: {
      nonce: 0n, // Placeholder; It's not usable anymore
      permission: getPermission(action.params),
    },
  },
});
