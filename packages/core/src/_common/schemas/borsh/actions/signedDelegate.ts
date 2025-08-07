import type { Schema } from 'borsh';
import { delegateActionBorshSchema } from '../delegateAction';
import { signatureBorshSchema } from '../signature';

export const signedDelegateActionBorshSchema: Schema = {
  struct: {
    delegateAction: delegateActionBorshSchema,
    signature: signatureBorshSchema,
  },
};
