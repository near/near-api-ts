import type {
  DeleteAccountAction,
  NativeDeleteAccountAction,
} from 'nat-types/actions/deleteAccount';

export const toNativeDeleteAccountAction = (
  action: DeleteAccountAction,
): NativeDeleteAccountAction => ({
  deleteAccount: {
    beneficiaryId: action.beneficiaryAccountId,
  },
});
