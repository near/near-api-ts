import type {
  DeleteKeyAction,
  DeleteKeyActionParams,
} from 'nat-types/actions/deleteKey';

export const deleteKey = (params: DeleteKeyActionParams): DeleteKeyAction => ({
  type: 'DeleteKey',
  params,
});
