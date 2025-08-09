import type {
  TransferAction,
  NativeTransferAction,
} from 'nat-types/actions/transfer';
import { nearAmount } from '../../../../helpers/tokens/near';

export const transfer = (action: TransferAction): NativeTransferAction => {
  const { amount } = action.params;

  return {
    transfer: { deposit: nearAmount(amount).yoctoNear },
  };
};
