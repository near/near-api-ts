import type { NativeAddKeyAction } from 'nat-types/actions/addKey';
import { toNativePublicKey } from '@common/transformers/toNative/publicKey';
import { throwableNearToken } from '../../../../helpers/tokens/nearToken';
import type { InnerAddKeyAction } from '@common/schemas/zod/transaction/actions/addKey';

const getPermission = (
  action: InnerAddKeyAction,
): NativeAddKeyAction['addKey']['accessKey']['permission'] => {
  if (action.accessType === 'FullAccess') return { fullAccess: {} };

  const { contractAccountId, gasBudget, allowedFunctions } = action;

  return {
    functionCall: {
      receiverId: contractAccountId,
      allowance: gasBudget && throwableNearToken(gasBudget).yoctoNear,
      methodNames: allowedFunctions ?? [],
    },
  };
};

export const toNativeAddKeyAction = (
  action: InnerAddKeyAction,
): NativeAddKeyAction => ({
  addKey: {
    publicKey: toNativePublicKey(action.publicKey),
    accessKey: {
      nonce: 0n, // Placeholder; It's not usable anymore: https://gov.near.org/t/issue-with-access-key-nonce/749
      permission: getPermission(action),
    },
  },
});
