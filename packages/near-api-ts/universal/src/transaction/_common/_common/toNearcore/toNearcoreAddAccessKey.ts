import type { FunctionCallPermission } from '../../../../../types/_common/accessKey';
import type {
  NearcoreAccessKeyPermission,
  NearcoreAddAccessKeyAction,
} from '../../../../../types/_common/transaction/actions/delegableActions/addAccessKey';
import { nearToken } from '../../../../_common/nearToken';
import { toNearcorePublicKey } from '../_common/toNearcorePublicKey';
import type { InnerAddAccessKeyAction } from '../zodSchemas/addAccessKey';

const toNearcoreFunctionCallPermission = (
  { allowedContract, allowedFunctions }: FunctionCallPermission,
  allowance: bigint | null,
) => ({
  receiverId: allowedContract,
  allowance,
  methodNames: allowedFunctions === 'AllNonPayable' ? [] : allowedFunctions,
});

const getPermission = (action: InnerAddAccessKeyAction): NearcoreAccessKeyPermission => {
  // Only a key paid from its own balance - a gas key - keeps a set of nonce channels. Nearcore
  // requires it to be added with an empty balance and without an allowance.
  if (action.replayProtection) {
    const gasKeyInfo = { balance: 0n, numNonces: action.replayProtection.channelCount };

    if (action.permission.kind === 'FullAccess') return { gasKeyFullAccess: gasKeyInfo };

    return {
      gasKeyFunctionCall: {
        gasKeyInfo,
        functionCallPermission: toNearcoreFunctionCallPermission(action.permission, null),
      },
    };
  }

  if (action.permission.kind === 'FullAccess') return { fullAccess: {} };

  // Always set on a FunctionCall key paid from the account balance - the schema requires it
  const { allowance } = action.gasPayment;

  return {
    functionCall: toNearcoreFunctionCallPermission(
      action.permission,
      allowance === undefined || allowance === 'Unlimited' ? null : nearToken(allowance).yoctoNear,
    ),
  };
};

export const toNearcoreAddAccessKeyAction = (
  action: InnerAddAccessKeyAction,
): NearcoreAddAccessKeyAction => ({
  addKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
    accessKey: {
      nonce: 0n, // Placeholder; It's not usable anymore: https://gov.near.org/t/issue-with-access-key-nonce/749
      permission: getPermission(action),
    },
  },
});
