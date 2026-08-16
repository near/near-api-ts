import { PublicKeyBorshSchema } from '../../_common/publicKey';

export const DeleteKeyActionBorshSchema = {
  struct: {
    deleteKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
      },
    },
  },
};
