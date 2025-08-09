import { publicKeyBorshSchema } from '../publicKey';

export const deleteKeyActionBorshSchema = {
  struct: {
    deleteKey: {
      struct: {
        publicKey: publicKeyBorshSchema,
      },
    },
  },
};
