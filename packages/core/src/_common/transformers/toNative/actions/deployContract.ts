import { base64 } from '@scure/base';
import type { NativeDeployContractAction } from 'nat-types/actions/deployContract';
import type { InnerDeployContractAction } from '@common/schemas/zod/transaction/actions/deployContract';

export const toNativeDeployContractAction = (
  action: InnerDeployContractAction,
): NativeDeployContractAction => {
  const code =
    'wasmBytes' in action ? action.wasmBytes : base64.decode(action.wasmBase64);

  return {
    deployContract: { code },
  };
};
