import type {
  TransferAction,
  NativeTransferAction,
} from 'nat-types/actions/transfer';
import { fromNearOption } from '../../../../helpers/near';

export const toNativeTransferAction = (
  action: TransferAction,
): NativeTransferAction => ({
  transfer: {
    deposit: fromNearOption(action.params.amount).yoctoNear,
  },
});
