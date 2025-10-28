import type {
  DeployContractAction,
  CreateDeployContractActionArgs,
} from 'nat-types/actions/deployContract';

export const deployContract = (
  args: CreateDeployContractActionArgs,
): DeployContractAction => ({
  ...args,
  actionType: 'DeployContract',
});
