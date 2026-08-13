import type { NativeDeleteAccountAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/deleteAccount';
import type { InnerDeleteAccountAction } from '../../zodSchemas/actions/deleteAccount';

export const toNativeDeleteAccountAction = (
  action: InnerDeleteAccountAction,
): NativeDeleteAccountAction => ({
  deleteAccount: {
    beneficiaryId: action.beneficiaryAccountId,
  },
});
