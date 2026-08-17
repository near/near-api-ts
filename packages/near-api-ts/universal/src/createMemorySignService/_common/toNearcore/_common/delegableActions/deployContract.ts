import type { NearcoreDeployContractAction } from '../../../../../../types/_common/transaction/actions/delegableActions/deployContract';
import type { InnerDeployContractAction } from '../../../zodSchemas/transaction/_common/delegableActions/deployContract';

export const toNearcoreDeployContractAction = (
  action: InnerDeployContractAction,
): NearcoreDeployContractAction => ({
  deployContract: { code: action.wasmBytes },
});
