import { PublicKeyBorshSchema } from '../publicKey';

export const DeleteKeyActionBorshSchema = {
  struct: {
    deleteKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
      },
    },
  },
};
