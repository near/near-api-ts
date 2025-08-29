import type {
  AddKeyAction,
  FunctionCallKeyParams,
} from 'nat-types/actions/addKey';

export const addFunctionCallKey = ({
  publicKey,
  contractAccountId,
  gasBudget,
  allowedFunctions,
}: Omit<FunctionCallKeyParams, 'accessType'>): AddKeyAction => ({
  actionType: 'AddKey',
  params: {
    accessType: 'FunctionCall',
    publicKey,
    contractAccountId,
    gasBudget,
    allowedFunctions,
  },
});
