import type { NearcoreStakeAction } from '../../../../../../types/_common/transaction/actions/delegableActions/stake';
import { nearToken } from '../../../../../_common/nearToken';
import type { InnerStakeAction } from '../../../_common/_common/zodSchemas/delegableActions/stake';
import { toNearcorePublicKey } from '../../_common/toNearcore/publicKey';

export const toNearcoreStakeAction = (action: InnerStakeAction): NearcoreStakeAction => ({
  stake: {
    stake: nearToken(action.amount).yoctoNear,
    publicKey: toNearcorePublicKey(action.validatorPublicKey),
  },
});
