import type { NearcoreDeployContractAction } from '../../../../../../types/_common/transaction/actions/delegableActions/deployContract';
import type { InnerDeployContractAction } from '../../../_common/_common/zodSchemas/delegableActions/deployContract';

export const toNearcoreDeployContractAction = (
  action: InnerDeployContractAction,
): NearcoreDeployContractAction => ({
  deployContract: { code: action.wasmBytes },
});
