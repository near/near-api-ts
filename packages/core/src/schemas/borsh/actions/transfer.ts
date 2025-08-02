import type { Schema } from 'borsh';

export const transferActionBorshSchema: Schema = {
  struct: {
    deposit: 'u128',
  },
};
