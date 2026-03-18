import type { NativeDeployContractAction } from '@universal/types/_common/transaction/actions/deployContract';
import type { InnerDeployContractAction } from '../../../schemas/zod/transaction/actions/deployContract';

export const toNativeDeployContractAction = (
  action: InnerDeployContractAction,
): NativeDeployContractAction => ({
  deployContract: { code: action.wasmBytes },
});
