import { throwableNearToken } from '../../../../helpers/tokens/nearToken';
import type { InnerStakeAction } from '@common/schemas/zod/transaction/actions/stake';
import type { NativeStakeAction } from 'nat-types/actions/stake';
import { toNativePublicKey } from '@common/transformers/toNative/publicKey';

export const toNativeStakeAction = (
  action: InnerStakeAction,
): NativeStakeAction => ({
  stake: {
    stake: throwableNearToken(action.amount).yoctoNear,
    publicKey: toNativePublicKey(action.validatorPublicKey),
  },
});
