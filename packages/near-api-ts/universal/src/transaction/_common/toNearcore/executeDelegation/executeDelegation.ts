import type { NearcoreSignedDelegation } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import type { InnerExecuteDelegationAction } from '../../zodSchemas/transaction/executeDelegation';
import { toNearcoreSignature } from '../_common/signature';
import { toNearcoreDelegation } from './delegation';

export const toNearcoreExecuteDelegation = (
  action: InnerExecuteDelegationAction,
): {
  executeDelegation: NearcoreSignedDelegation;
} => ({
  executeDelegation: {
    delegation: toNearcoreDelegation(action.delegation),
    signature: toNearcoreSignature(action.signature),
  },
});
