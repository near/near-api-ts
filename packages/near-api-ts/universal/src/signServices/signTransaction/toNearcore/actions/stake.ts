import type { NearcoreStakeAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/stake';
import { nearToken } from '../../../../_common/nearToken';
import type { InnerStakeAction } from '../../zodSchemas/actions/stake';
import { toNearcorePublicKey } from '../publicKey';

export const toNearcoreStakeAction = (action: InnerStakeAction): NearcoreStakeAction => ({
  stake: {
    stake: nearToken(action.amount).yoctoNear,
    publicKey: toNearcorePublicKey(action.validatorPublicKey),
  },
});
