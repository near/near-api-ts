import type { NativeDeployContractAction } from 'nat-types/actions/deployContract';
import type { InnerDeployContractAction } from '@common/schemas/zod/transaction/actions/deployContract';

export const toNativeDeployContractAction = (
  action: InnerDeployContractAction,
): NativeDeployContractAction => ({
  deployContract: { code: action.wasmBytes },
});
