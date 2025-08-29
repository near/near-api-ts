import type { AccountId } from 'nat-types/common';

export type DeleteAccountActionParams = {
  beneficiaryAccountId: AccountId;
};

export type DeleteAccountAction = {
  actionType: 'DeleteAccount';
  params: DeleteAccountActionParams;
};

// ****** NATIVE ********

export type NativeDeleteAccountAction = {
  deleteAccount: {
    beneficiaryId: AccountId;
  };
};
