import type {
  FunctionCallAction,
  FunctionCallParams,
} from 'nat-types/actions/functionCall';

export const functionCall = <ArgsJson extends object>(
  params: FunctionCallParams<ArgsJson>,
): FunctionCallAction<ArgsJson> => ({
  type: 'FunctionCall',
  params,
});
