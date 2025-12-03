import type { NativeDeleteAccountAction } from 'nat-types/actions/deleteAccount';
import type { InnerDeleteAccountAction } from '@common/schemas/zod/transaction/actions/deleteAccount';

export const toNativeDeleteAccountAction = (
  action: InnerDeleteAccountAction,
): NativeDeleteAccountAction => ({
  deleteAccount: {
    beneficiaryId: action.beneficiaryAccountId,
  },
});
