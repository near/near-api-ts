import type { Schema } from 'borsh';

const globalContractIdentifierBorshSchema: Schema = {
  enum: [
    { struct: { CodeHash: { array: { type: 'u8', len: 32 } } } },
    { struct: { AccountId: 'string' } },
  ],
};

export const useGlobalContractActionBorshSchema: Schema = {
  struct: {
    contractIdentifier: globalContractIdentifierBorshSchema,
  },
};
