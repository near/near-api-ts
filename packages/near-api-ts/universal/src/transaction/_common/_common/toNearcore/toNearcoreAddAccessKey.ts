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

const getPermission = ({
  permission,
  gasPayment,
  replayProtection,
}: InnerAddAccessKeyAction): NearcoreAccessKeyPermission => {
  // Only a key paid from its own balance - a gas key - keeps a set of nonce channels. Nearcore
  // requires it to be added with an empty balance and without an allowance.
  if (replayProtection.scheme === 'NonceChannels') {
    const gasKeyInfo = { balance: 0n, numNonces: replayProtection.channelCount };

    if (permission.kind === 'FullAccess') return { gasKeyFullAccess: gasKeyInfo };

    return {
      gasKeyFunctionCall: {
        gasKeyInfo,
        functionCallPermission: toNearcoreFunctionCallPermission(permission, null),
      },
    };
  }

  // Nearcore has no allowance for a full access key - the schema allows only 'Unlimited' there
  if (permission.kind === 'FullAccess') return { fullAccess: {} };

  // Always set on a key paid from the account balance - the schema requires it
  const { allowance } = gasPayment;

  return {
    functionCall: toNearcoreFunctionCallPermission(
      permission,
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
