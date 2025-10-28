import type {
  DeleteAccountAction,
  CreateDeleteAccountActionArgs,
} from 'nat-types/actions/deleteAccount';

export const deleteAccount = (
  args: CreateDeleteAccountActionArgs,
): DeleteAccountAction => ({
  ...args,
  actionType: 'DeleteAccount',
});
