import type { Schema } from 'borsh';
import { publicKeyBorshSchema } from '../publicKey';

export const stakeActionBorshSchema: Schema = {
  struct: {
    stake: 'u128',
    publicKey: publicKeyBorshSchema,
  },
};
