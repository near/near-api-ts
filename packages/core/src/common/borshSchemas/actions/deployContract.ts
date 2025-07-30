import type { Schema } from 'borsh';

export const deployContractActionBorshSchema: Schema = {
  struct: {
    code: { array: { type: 'u8' } },
  },
};
