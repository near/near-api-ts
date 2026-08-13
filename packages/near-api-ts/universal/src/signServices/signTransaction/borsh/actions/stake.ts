import { PublicKeyBorshSchema } from '../publicKey';

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
