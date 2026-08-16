import { SignedDelegationBorshSchema } from './delegation';

export const DelegateActionBorshSchema = {
  struct: {
    delegate: SignedDelegationBorshSchema,
  },
};
