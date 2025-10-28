import type {
  AddFunctionCallKeyAction,
  CreateAddFunctionCallKeyActionArgs,
} from 'nat-types/actions/addKey';

export const addFunctionCallKey = (
  args: CreateAddFunctionCallKeyActionArgs,
): AddFunctionCallKeyAction => ({
  ...args,
  actionType: 'AddKey',
  accessType: 'FunctionCall',
});
