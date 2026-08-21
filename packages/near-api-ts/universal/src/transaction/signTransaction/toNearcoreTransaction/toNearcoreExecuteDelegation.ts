import type { NearcoreSignedDelegation } from '../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { toNearcoreDelegation } from '../../_common/toNearcore/toNearcoreDelegation';
import { toNearcoreSignature } from '../../_common/toNearcore/toNearcoreSignature';
import type { InnerExecuteDelegationAction } from '../zodSchemas/transaction/executeDelegation';

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
