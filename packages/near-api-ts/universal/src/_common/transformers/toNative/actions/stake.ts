import { throwableNearToken } from '../../../../helpers/tokens/nearToken';
import type { InnerStakeAction } from '../../../schemas/zod/transaction/actions/stake';
import type { NativeStakeAction } from '../../../../../types/actions/stake';
import { toNativePublicKey } from '../publicKey';

export const toNativeStakeAction = (
  action: InnerStakeAction,
): NativeStakeAction => ({
  stake: {
    stake: throwableNearToken(action.amount).yoctoNear,
    publicKey: toNativePublicKey(action.validatorPublicKey),
  },
});
