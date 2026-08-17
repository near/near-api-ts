import type { NearcoreTransferAction } from '../../../../../../types/_common/transaction/actions/delegableActions/transfer';
import { nearToken } from '../../../../../_common/nearToken';
import type { InnerTransferAction } from '../../../zodSchemas/transaction/_common/delegableActions/transfer';

export const toNearcoreTransferAction = (action: InnerTransferAction): NearcoreTransferAction => ({
  transfer: {
    deposit: nearToken(action.amount).yoctoNear,
  },
});
