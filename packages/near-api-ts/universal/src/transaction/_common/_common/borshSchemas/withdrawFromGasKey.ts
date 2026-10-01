import { PublicKeyBorshSchema } from '../_common/publicKeyBorshSchema';

export const WithdrawFromGasKeyActionBorshSchema = {
  struct: {
    withdrawFromGasKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
        amount: 'u128',
      },
    },
  },
};
