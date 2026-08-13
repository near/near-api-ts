import type { NearcoreTransferAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/transfer';
import { nearToken } from '../../../../_common/nearToken';
import type { InnerTransferAction } from '../../zodSchemas/actions/transfer';

export const toNearcoreTransferAction = (action: InnerTransferAction): NearcoreTransferAction => ({
  transfer: {
    deposit: nearToken(action.amount).yoctoNear,
  },
});
