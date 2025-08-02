import type { Schema } from 'borsh';
import { delegateActionBorshSchema } from '@schemas/borsh';
import { signatureBorshSchema } from '../signature';

export const signedDelegateActionBorshSchema: Schema = {
  struct: {
    delegateAction: delegateActionBorshSchema,
    signature: signatureBorshSchema,
  },
};
