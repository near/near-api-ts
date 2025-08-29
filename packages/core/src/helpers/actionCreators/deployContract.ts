import type {
  DeployContractAction,
  DeployContractActionParams,
} from 'nat-types/actions/deployContract';

export const deployContract = (
  params: DeployContractActionParams,
): DeployContractAction => ({
  actionType: 'DeployContract',
  params,
});


