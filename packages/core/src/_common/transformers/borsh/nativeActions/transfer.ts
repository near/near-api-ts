import type {
  TransferAction,
  NativeTransferAction,
} from 'nat-types/actions/transfer';
import { nearAmount } from '../../../../helpers/tokens/near';

export const transfer = (action: TransferAction): NativeTransferAction => ({
  transfer: {
    deposit: nearAmount(action.params.amount).yoctoNear,
  },
});
