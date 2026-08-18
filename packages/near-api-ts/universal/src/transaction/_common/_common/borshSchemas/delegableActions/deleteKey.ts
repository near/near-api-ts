import { PublicKeyBorshSchema } from '../../_common/borshSchemas/publicKey';

export const DeleteKeyActionBorshSchema = {
  struct: {
    deleteKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
      },
    },
  },
};
