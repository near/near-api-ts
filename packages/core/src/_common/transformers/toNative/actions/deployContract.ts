import { base64 } from '@scure/base';
import type {
  DeployContractAction,
  NativeDeployContractAction,
} from 'nat-types/actions/deployContract';

export const toNativeDeployContractAction = (
  action: DeployContractAction,
): NativeDeployContractAction => {
  const code = action.params.wasmBytes
    ? action.params.wasmBytes
    : base64.decode(action.params.wasmBase64);

  return {
    deployContract: { code },
  };
};
