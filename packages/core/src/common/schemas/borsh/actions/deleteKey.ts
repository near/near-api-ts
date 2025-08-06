import type { Schema } from 'borsh';
import { publicKeyBorshSchema } from '../publicKey';

export const deleteKeyActionBorshSchema: Schema = {
  struct: {
    publicKey: publicKeyBorshSchema,
  },
};
