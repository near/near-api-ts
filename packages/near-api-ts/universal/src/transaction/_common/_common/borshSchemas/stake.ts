import { PublicKeyBorshSchema } from '../_common/publicKeyBorshSchema';

export const StakeActionBorshSchema = {
  struct: {
    stake: {
      struct: {
        stake: 'u128',
        publicKey: PublicKeyBorshSchema,
      },
    },
  },
};
