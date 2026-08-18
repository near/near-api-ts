import { PublicKeyBorshSchema } from '../../_common/borshSchemas/publicKey';

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
