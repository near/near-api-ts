import type {
  AddFullAccessKeyAction,
  CreateAddFullAccessKeyActionArgs,
} from 'nat-types/actions/addKey';

export const addFullAccessKey = (
  args: CreateAddFullAccessKeyActionArgs,
): AddFullAccessKeyAction => ({
  ...args,
  actionType: 'AddKey',
  accessType: 'FullAccess',
});
