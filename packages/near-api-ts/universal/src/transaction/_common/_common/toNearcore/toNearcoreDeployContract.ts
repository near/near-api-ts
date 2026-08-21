import type { NearcoreDeployContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/deployContract';
import type { InnerDeployContractAction } from '../zodSchemas/deployContract';

export const toNearcoreDeployContractAction = (
  action: InnerDeployContractAction,
): NearcoreDeployContractAction => ({
  deployContract: { code: action.wasmBytes },
});
