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
        receiverId: 'string',
        allowance: { option: 'u128' },
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
        fullAccessPermissionBorshSchema,
        functionCallPermissionBorshSchema,
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
