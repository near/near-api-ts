import type { AccountId } from 'nat-types/common';

export type DeleteAccountActionParams = {
  beneficiaryAccountId: AccountId;
};

export type DeleteAccountAction = {
  type: 'DeleteAccount';
  params: DeleteAccountActionParams;
};

export type NativeDeleteAccountAction = {
  deleteAccount: {
    beneficiaryId: AccountId;
  };
};
