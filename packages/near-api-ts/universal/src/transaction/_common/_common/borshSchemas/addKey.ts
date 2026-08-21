import { PublicKeyBorshSchema } from '../_common/borshSchemas/publicKey';

const FullAccessPermissionBorshSchema = {
  struct: {
    fullAccess: {
      struct: {},
    },
  },
};

const FunctionCallPermissionBorshSchema = {
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

const AccessKeyBorshSchema = {
  struct: {
    nonce: 'u64',
    permission: {
      enum: [FunctionCallPermissionBorshSchema, FullAccessPermissionBorshSchema],
    },
  },
};

export const AddKeyActionBorshSchema = {
  struct: {
    addKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
        accessKey: AccessKeyBorshSchema,
      },
    },
  },
};
