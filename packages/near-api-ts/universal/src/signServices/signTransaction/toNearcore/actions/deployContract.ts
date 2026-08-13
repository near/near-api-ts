import type { NearcoreDeployContractAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/deployContract';
import type { InnerDeployContractAction } from '../../zodSchemas/actions/deployContract';

export const toNearcoreDeployContractAction = (
  action: InnerDeployContractAction,
): NearcoreDeployContractAction => ({
  deployContract: { code: action.wasmBytes },
});
