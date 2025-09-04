import type {
  FunctionCallAction,
  FunctionCallParams,
} from 'nat-types/actions/functionCall';

export const functionCall = <Args extends object>(
  params: FunctionCallParams<Args>,
): FunctionCallAction<Args> => ({
  actionType: 'FunctionCall',
  params,
});
