import { PublicKeyBorshSchema } from '../_common/publicKeyBorshSchema';

const FunctionCallPermissionBorshSchema = {
  struct: {
    allowance: { option: 'u128' },
    receiverId: 'string',
    methodNames: { array: { type: 'string' } },
  },
};

const GasKeyInfoBorshSchema = {
  struct: {
    balance: 'u128',
    numNonces: 'u16',
  },
};

const FunctionCallVariantBorshSchema = {
  struct: {
    functionCall: FunctionCallPermissionBorshSchema,
  },
};

const FullAccessVariantBorshSchema = {
  struct: {
    fullAccess: { struct: {} },
  },
};

// A tuple variant encodes its fields one after another - the same bytes as a struct of them
const GasKeyFunctionCallVariantBorshSchema = {
  struct: {
    gasKeyFunctionCall: {
      struct: {
        gasKeyInfo: GasKeyInfoBorshSchema,
        functionCallPermission: FunctionCallPermissionBorshSchema,
      },
    },
  },
};

const GasKeyFullAccessVariantBorshSchema = {
  struct: {
    gasKeyFullAccess: GasKeyInfoBorshSchema,
  },
};

const AccessKeyBorshSchema = {
  struct: {
    nonce: 'u64',
    // Order matters — the enum index is the nearcore AccessKeyPermission discriminant
    permission: {
      enum: [
        FunctionCallVariantBorshSchema,
        FullAccessVariantBorshSchema,
        GasKeyFunctionCallVariantBorshSchema,
        GasKeyFullAccessVariantBorshSchema,
      ],
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
