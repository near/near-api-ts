import type {
  DeleteAccountAction,
  NativeDeleteAccountAction,
} from 'nat-types/actions/deleteAccount';

export const deleteAccount = (
  action: DeleteAccountAction,
): NativeDeleteAccountAction => ({
  deleteAccount: {
    beneficiaryId: action.params.beneficiaryAccountId,
  },
});
