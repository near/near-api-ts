import type { NearcoreRegisterLinkableGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/registerLinkableGlobalContract';
import type { InnerRegisterLinkableGlobalContractAction } from '../zodSchemas/registerLinkableGlobalContract';

export const toNearcoreRegisterLinkableGlobalContractAction = (
  action: InnerRegisterLinkableGlobalContractAction,
): NearcoreRegisterLinkableGlobalContractAction => ({
  deployGlobalContract: {
    code: action.wasmU8,
    deployMode: { accountId: {} },
  },
});
