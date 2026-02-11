import { delegateActionBorshSchema } from '../delegateAction';
import { signatureBorshSchema } from '../signature';

export const signedDelegateActionBorshSchema = {
  struct: {
    signedDelegate: {
      struct: {
        delegateAction: delegateActionBorshSchema,
        signature: signatureBorshSchema,
      },
    },
  },
};
