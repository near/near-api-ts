import type { NearcoreSignedDelegation } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { toNearcoreDelegation } from '../../../_common/toNearcore/delegation';
import { toNearcoreSignature } from '../../../_common/toNearcore/signature';
import type { InnerExecuteDelegationAction } from '../../../_common/zodSchemas/transaction/executeDelegation';

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
