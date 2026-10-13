import type { NearcoreDeployLocalContractAction } from '../../../../../types/_common/transaction/actions/delegableActions/deployLocalContract';
import type { InnerDeployLocalContractAction } from '../zodSchemas/deployLocalContract';

export const toNearcoreDeployLocalContractAction = (
  action: InnerDeployLocalContractAction,
): NearcoreDeployLocalContractAction => ({
  deployContract: { code: action.wasmU8 },
});
