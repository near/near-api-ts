import { PublicKeyBorshSchema } from '../_common/publicKeyBorshSchema';

export const TransferToGasKeyActionBorshSchema = {
  struct: {
    transferToGasKey: {
      struct: {
        publicKey: PublicKeyBorshSchema,
        deposit: 'u128',
      },
    },
  },
};
