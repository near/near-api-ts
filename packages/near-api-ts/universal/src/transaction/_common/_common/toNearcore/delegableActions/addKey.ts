import type { NearcoreAddKeyAction } from '../../../../../../types/_common/transaction/actions/delegableActions/addKey';
import { nearToken } from '../../../../../_common/nearToken';
import type { InnerAddKeyAction } from '../../../_common/_common/zodSchemas/delegableActions/addKey';
import { toNearcorePublicKey } from '../../_common/toNearcore/publicKey';

const getPermission = (
  action: InnerAddKeyAction,
): NearcoreAddKeyAction['addKey']['accessKey']['permission'] => {
  if (action.accessType === 'FullAccess') return { fullAccess: {} };

  const { contractAccountId, gasBudget, allowedFunctions } = action;

  return {
    functionCall: {
      receiverId: contractAccountId,
      allowance: gasBudget === 'Unlimited' ? null : nearToken(gasBudget).yoctoNear,
      methodNames: allowedFunctions === 'AllNonPayable' ? [] : allowedFunctions,
    },
  };
};

export const toNearcoreAddKeyAction = (action: InnerAddKeyAction): NearcoreAddKeyAction => ({
  addKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
    accessKey: {
      nonce: 0n, // Placeholder; It's not usable anymore: https://gov.near.org/t/issue-with-access-key-nonce/749
      permission: getPermission(action),
    },
  },
});
