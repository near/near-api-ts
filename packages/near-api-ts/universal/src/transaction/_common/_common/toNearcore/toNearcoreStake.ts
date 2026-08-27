import type { NearcoreStakeAction } from '../../../../../types/_common/transaction/actions/delegableActions/stake';
import { nearToken } from '../../../../_common/nearToken';
import { toNearcorePublicKey } from '../_common/toNearcorePublicKey';
import type { InnerStakeAction } from '../zodSchemas/stake';

export const toNearcoreStakeAction = (action: InnerStakeAction): NearcoreStakeAction => ({
  stake: {
    stake: nearToken(action.amount).yoctoNear,
    publicKey: toNearcorePublicKey(action.validatorPublicKey),
  },
});
