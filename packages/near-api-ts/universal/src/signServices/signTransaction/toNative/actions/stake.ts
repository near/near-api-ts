import type { NativeStakeAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/stake';
import { nearToken } from '../../../../_common/nearToken';
import type { InnerStakeAction } from '../../zodSchemas/actions/stake';
import { toNativePublicKey } from '../publicKey';

export const toNativeStakeAction = (action: InnerStakeAction): NativeStakeAction => ({
  stake: {
    stake: nearToken(action.amount).yoctoNear,
    publicKey: toNativePublicKey(action.validatorPublicKey),
  },
});
