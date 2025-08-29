import type {
  DeleteAccountAction,
  DeleteAccountActionParams,
} from 'nat-types/actions/deleteAccount';

export const deleteAccount = (
  params: DeleteAccountActionParams,
): DeleteAccountAction => ({
  actionType: 'DeleteAccount',
  params,
});
