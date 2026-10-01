import type { NearcoreTopUpAccessKeyBalanceAction } from '../../../../../types/_common/transaction/actions/delegableActions/topUpAccessKeyBalance';
import { nearToken } from '../../../../_common/nearToken';
import { toNearcorePublicKey } from '../_common/toNearcorePublicKey';
import type { InnerTopUpAccessKeyBalanceAction } from '../zodSchemas/topUpAccessKeyBalance';

export const toNearcoreTopUpAccessKeyBalanceAction = (
  action: InnerTopUpAccessKeyBalanceAction,
): NearcoreTopUpAccessKeyBalanceAction => ({
  transferToGasKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
    deposit: nearToken(action.amount).yoctoNear,
  },
});
