import { base64 } from '@scure/base';
import type {
  DeployContractAction,
  NativeDeployContractAction,
} from 'nat-types/actions/deployContract';

export const toNativeDeployContractAction = (
  action: DeployContractAction,
): NativeDeployContractAction => {
  const code = action.wasmBytes
    ? action.wasmBytes
    : base64.decode(action.wasmBase64);

  return {
    deployContract: { code },
  };
};
