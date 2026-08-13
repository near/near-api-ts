import type { NativeDeployContractAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/deployContract';
import type { InnerDeployContractAction } from '../../zodSchemas/actions/deployContract';

export const toNativeDeployContractAction = (
  action: InnerDeployContractAction,
): NativeDeployContractAction => ({
  deployContract: { code: action.wasmBytes },
});
