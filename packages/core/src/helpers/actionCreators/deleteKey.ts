import type {
  DeleteKeyAction,
  CreateDeleteKeyActionArgs,
} from 'nat-types/actions/deleteKey';

export const deleteKey = (
  args: CreateDeleteKeyActionArgs,
): DeleteKeyAction => ({
  ...args,
  actionType: 'DeleteKey',
});
