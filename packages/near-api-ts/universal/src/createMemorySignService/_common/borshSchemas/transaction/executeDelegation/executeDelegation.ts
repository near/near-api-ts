import { SignedDelegationBorshSchema } from './delegation';

export const ExecuteDelegationActionBorshSchema = {
  struct: {
    executeDelegation: SignedDelegationBorshSchema,
  },
};
