import type { NearcoreDeleteAccountAction } from '../../../../../../types/_common/transaction/actions/nonDelegateActions/deleteAccount';
import type { InnerDeleteAccountAction } from '../../../zodSchemas/transaction/actions/deleteAccount';

export const toNearcoreDeleteAccountAction = (
  action: InnerDeleteAccountAction,
): NearcoreDeleteAccountAction => ({
  deleteAccount: {
    beneficiaryId: action.beneficiaryAccountId,
  },
});
