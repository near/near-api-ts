import type { Schema } from 'borsh';
import { publicKeyBorshSchema } from '../publicKey';

const fullAccessPermissionBorshSchema: Schema = {
  struct: {},
};

const functionCallPermissionBorshSchema: Schema = {
  struct: {
    receiverId: 'string',
    allowance: { option: 'u128' },
    methodNames: { array: { type: 'string' } },
  },
};

const accessKeyPermissionBorshSchema: Schema = {
  enum: [
    { struct: { fullAccess: fullAccessPermissionBorshSchema } },
    { struct: { functionCall: functionCallPermissionBorshSchema } },
  ],
};

const accessKeyBorshSchema: Schema = {
  struct: {
    nonce: 'u64',
    permission: accessKeyPermissionBorshSchema,
  },
};

export const addKeyActionBorshSchema: Schema = {
  struct: {
    publicKey: publicKeyBorshSchema,
    accessKey: accessKeyBorshSchema,
  },
};
