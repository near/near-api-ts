import { PublicKeyBorshSchema } from '../publicKey';

export const stakeActionBorshSchema = {
  struct: {
    stake: {
      struct: {
        stake: 'u128',
        publicKey: PublicKeyBorshSchema,
      },
    },
  },
};
