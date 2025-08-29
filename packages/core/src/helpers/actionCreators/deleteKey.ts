import type {
  DeleteKeyAction,
  DeleteKeyActionParams,
} from 'nat-types/actions/deleteKey';

export const deleteKey = (params: DeleteKeyActionParams): DeleteKeyAction => ({
  actionType: 'DeleteKey',
  params,
});
