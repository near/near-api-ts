import type { Schema } from 'borsh';

export const functionCallActionBorshSchema: Schema = {
  struct: {
    methodName: 'string',
    args: { array: { type: 'u8' } },
    gas: 'u64',
    deposit: 'u128',
  },
};
