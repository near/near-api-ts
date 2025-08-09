import type {
  AddKeyAction,
  NativeAddKeyAction,
} from 'nat-types/actions/addKey';
import { toNativePublicKey } from '@common/transformers/borsh/toNativePublicKey';
import { nearAmount } from '../../../../helpers/tokens/near';

const getPermission = (
  params: AddKeyAction['params'],
): NativeAddKeyAction['addKey']['accessKey']['permission'] => {
  if (params.permission === 'FullAccess') return { fullAccess: {} };

  const { contractAccountId, gasBudget, allowedFunctions } =
    params.restrictions;

  return {
    functionCall: {
      receiverId: contractAccountId,
      allowance: gasBudget && nearAmount(gasBudget).yoctoNear,
      methodNames: allowedFunctions ?? [],
    },
  };
};

export const addKey = (action: AddKeyAction): NativeAddKeyAction => ({
  addKey: {
    publicKey: toNativePublicKey(action.params.publicKey),
    accessKey: {
      nonce: 0n, // Placeholder; It's not usable anymore
      permission: getPermission(action.params),
    },
  },
});
