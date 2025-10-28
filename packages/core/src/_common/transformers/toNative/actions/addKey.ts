import type {
  AddKeyAction,
  NativeAddKeyAction,
} from 'nat-types/actions/addKey';
import { toNativePublicKey } from '@common/transformers/toNative/publicKey';
import { fromNearOption } from '../../../../helpers/near';

const getPermission = (
  action: AddKeyAction,
): NativeAddKeyAction['addKey']['accessKey']['permission'] => {
  if (action.accessType === 'FullAccess') return { fullAccess: {} };

  const { contractAccountId, gasBudget, allowedFunctions } = action;

  return {
    functionCall: {
      receiverId: contractAccountId,
      allowance: gasBudget && fromNearOption(gasBudget).yoctoNear,
      methodNames: allowedFunctions ?? [],
    },
  };
};

export const toNativeAddKeyAction = (
  action: AddKeyAction,
): NativeAddKeyAction => ({
  addKey: {
    publicKey: toNativePublicKey(action.publicKey),
    accessKey: {
      nonce: 0n, // Placeholder; It's not usable anymore: https://gov.near.org/t/issue-with-access-key-nonce/749
      permission: getPermission(action),
    },
  },
});
