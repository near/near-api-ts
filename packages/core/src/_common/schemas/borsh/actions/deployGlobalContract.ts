import type { Schema } from 'borsh';

const globalContractDeployModeBorshSchema: Schema = {
  enum: [
    { struct: { CodeHash: { struct: {} } } },
    { struct: { AccountId: { struct: {} } } },
  ],
};

export const deployGlobalContractActionBorshSchema: Schema = {
  struct: {
    code: { array: { type: 'u8' } },
    deployMode: globalContractDeployModeBorshSchema,
  },
};
