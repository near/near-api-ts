import { publicKeyBorshSchema } from '../publicKey';

const fullAccessPermissionBorshSchema = {
  struct: {
    fullAccess: {
      struct: {},
    },
  },
};

const functionCallPermissionBorshSchema = {
  struct: {
    functionCall: {
      struct: {
        allowance: { option: 'u128' },
        receiverId: 'string',
        methodNames: { array: { type: 'string' } },
      },
    },
  },
};

const accessKeyBorshSchema = {
  struct: {
    nonce: 'u64',
    permission: {
      enum: [
        functionCallPermissionBorshSchema,
        fullAccessPermissionBorshSchema,
      ],
    },
  },
};

export const addKeyActionBorshSchema = {
  struct: {
    addKey: {
      struct: {
        publicKey: publicKeyBorshSchema,
        accessKey: accessKeyBorshSchema,
      },
    },
  },
};
