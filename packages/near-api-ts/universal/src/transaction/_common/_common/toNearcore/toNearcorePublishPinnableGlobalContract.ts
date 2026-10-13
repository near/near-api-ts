import type { NearcorePublishPinnableGlobalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/publishPinnableGlobalContract';
import type { InnerPublishPinnableGlobalContractAction } from '../zodSchemas/publishPinnableGlobalContract';

export const toNearcorePublishPinnableGlobalContractAction = (
  action: InnerPublishPinnableGlobalContractAction,
): NearcorePublishPinnableGlobalContractAction => ({
  deployGlobalContract: {
    code: action.wasmU8,
    deployMode: { codeHash: {} },
  },
});
