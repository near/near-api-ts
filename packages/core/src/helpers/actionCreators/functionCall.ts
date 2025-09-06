import type {
  FunctionCallAction,
  FunctionCallParams,
} from 'nat-types/actions/functionCall';
import type { MaybeJsonLikeValue } from 'nat-types/common';

export const functionCall = <AJ extends MaybeJsonLikeValue>(
  params: FunctionCallParams<AJ>,
): FunctionCallAction<AJ> => ({
  actionType: 'FunctionCall',
  params,
});
