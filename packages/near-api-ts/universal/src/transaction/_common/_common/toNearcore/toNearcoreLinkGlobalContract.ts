import type { NearcoreLinkGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/linkGlobalContract';
import type { InnerLinkGlobalContractAction } from '../zodSchemas/linkGlobalContract';

export const toNearcoreLinkGlobalContractAction = (
  action: InnerLinkGlobalContractAction,
): NearcoreLinkGlobalContractAction => ({
  useGlobalContract: {
    contractIdentifier: { accountId: action.globalContractAccountId },
  },
});
