import type { Schema } from 'borsh';

export const deleteAccountActionBorshSchema: Schema = {
  struct: {
    beneficiaryId: 'string',
  },
};
