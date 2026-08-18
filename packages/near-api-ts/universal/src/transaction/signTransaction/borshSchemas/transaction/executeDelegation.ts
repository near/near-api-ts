import { SignedDelegationBorshSchema } from '../../../_common/borshSchemas/delegation';

export const ExecuteDelegationActionBorshSchema = {
  struct: {
    executeDelegation: SignedDelegationBorshSchema,
  },
};
