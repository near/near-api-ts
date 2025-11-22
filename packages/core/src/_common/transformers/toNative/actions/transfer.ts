import type {
  TransferAction,
  NativeTransferAction,
} from 'nat-types/actions/transfer';
import { nearToken } from '../../../../helpers/tokens/nearToken';

export const toNativeTransferAction = (
  action: TransferAction,
): NativeTransferAction => ({
  transfer: {
    deposit: nearToken(action.amount).yoctoNear,
  },
});
