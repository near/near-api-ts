import { SignedDelegateActionBorshSchema } from '../delegateAction';

export const DelegateActionActionBorshSchema = {
  struct: {
    delegate: SignedDelegateActionBorshSchema,
  },
};
