import type { NearcoreWithdrawAccessKeyBalanceAction } from '../../../../types/_common/transaction/actions/delegableActions/withdrawAccessKeyBalance';
import { nearToken } from '../../../_common/nearToken';
import { toNearcorePublicKey } from '../../_common/_common/_common/toNearcorePublicKey';
import type { InnerWithdrawAccessKeyBalanceAction } from '../transactionZodSchema/withdrawAccessKeyBalance';

export const toNearcoreWithdrawAccessKeyBalanceAction = (
  action: InnerWithdrawAccessKeyBalanceAction,
): NearcoreWithdrawAccessKeyBalanceAction => ({
  withdrawFromGasKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
    amount: nearToken(action.amount).yoctoNear,
  },
});
