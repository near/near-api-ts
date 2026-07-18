import type { NativeTransferAction } from '../../../../../types/_common/transaction/actions/transfer';
import { nearToken } from '../../../../helpers/tokens/nearToken';
import type { InnerTransferAction } from '../../../schemas/zod/transaction/actions/transfer';

export const toNativeTransferAction = (action: InnerTransferAction): NativeTransferAction => ({
  transfer: {
    deposit: nearToken(action.amount).yoctoNear,
  },
});
