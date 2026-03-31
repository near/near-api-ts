import { PublicKeyBorshSchema } from '../publicKey';

export const deleteKeyActionBorshSchema = {
  struct: {
    deleteKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
      },
    },
  },
};
