import { PublicKeyBorshSchema } from '../_common/publicKeyBorshSchema';

export const DeleteKeyActionBorshSchema = {
  struct: {
    deleteKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
      },
    },
  },
};
