import type { NativeDeleteAccountAction } from '@universal/types/actions/deleteAccount';
import type { InnerDeleteAccountAction } from '../../../schemas/zod/transaction/actions/deleteAccount';

export const toNativeDeleteAccountAction = (
  action: InnerDeleteAccountAction,
): NativeDeleteAccountAction => ({
  deleteAccount: {
    beneficiaryId: action.beneficiaryAccountId,
  },
});
