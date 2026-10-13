import type { NearcorePublishLinkableGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/publishLinkableGlobalContract';
import type { InnerPublishLinkableGlobalContractAction } from '../zodSchemas/publishLinkableGlobalContract';

export const toNearcorePublishLinkableGlobalContractAction = (
  action: InnerPublishLinkableGlobalContractAction,
): NearcorePublishLinkableGlobalContractAction => ({
  deployGlobalContract: {
    code: action.wasmU8,
    deployMode: { accountId: {} },
  },
});
