import type { NearcoreRegisterPinnableGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/registerPinnableGlobalContract';
import type { InnerRegisterPinnableGlobalContractAction } from '../zodSchemas/registerPinnableGlobalContract';

export const toNearcoreRegisterPinnableGlobalContractAction = (
  action: InnerRegisterPinnableGlobalContractAction,
): NearcoreRegisterPinnableGlobalContractAction => ({
  deployGlobalContract: {
    code: action.wasmU8,
    deployMode: { codeHash: {} },
  },
});
