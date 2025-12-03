import type { NativeTransferAction } from 'nat-types/actions/transfer';
import { throwableNearToken } from '../../../../helpers/tokens/nearToken';
import type { InnerTransferAction } from '@common/schemas/zod/transaction/actions/transfer';

export const toNativeTransferAction = (
  action: InnerTransferAction,
): NativeTransferAction => ({
  transfer: {
    deposit: throwableNearToken(action.amount).yoctoNear,
  },
});
