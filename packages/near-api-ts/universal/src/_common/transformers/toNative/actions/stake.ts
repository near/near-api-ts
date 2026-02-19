import type { NativeStakeAction } from '@universal/types/actions/stake';
import { throwableNearToken } from '../../../../helpers/tokens/nearToken';
import type { InnerStakeAction } from '../../../schemas/zod/transaction/actions/stake';
import { toNativePublicKey } from '../publicKey';

export const toNativeStakeAction = (
  action: InnerStakeAction,
): NativeStakeAction => ({
  stake: {
    stake: throwableNearToken(action.amount).yoctoNear,
    publicKey: toNativePublicKey(action.validatorPublicKey),
  },
});
