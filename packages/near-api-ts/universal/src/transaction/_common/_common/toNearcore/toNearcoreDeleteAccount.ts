import type { NearcoreDeleteAccountAction } from '../../../../../types/_common/transaction/actions/delegableActions/deleteAccount';
import type { InnerDeleteAccountAction } from '../zodSchemas/deleteAccount';

export const toNearcoreDeleteAccountAction = (
  action: InnerDeleteAccountAction,
): NearcoreDeleteAccountAction => ({
  deleteAccount: {
    beneficiaryId: action.beneficiaryAccountId,
  },
});
