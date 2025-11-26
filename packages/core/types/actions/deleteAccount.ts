import type { AccountId } from 'nat-types/_common/common';

export type CreateDeleteAccountActionArgs = {
  beneficiaryAccountId: AccountId;
};

export type DeleteAccountAction = {
  actionType: 'DeleteAccount';
} & CreateDeleteAccountActionArgs;

// ****** NATIVE ********

export type NativeDeleteAccountAction = {
  deleteAccount: {
    beneficiaryId: AccountId;
  };
};
