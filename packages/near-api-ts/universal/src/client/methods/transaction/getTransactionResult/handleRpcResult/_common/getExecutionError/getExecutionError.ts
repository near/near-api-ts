import type { ActionError } from '@near-js/jsonrpc-types';
import type { ExecutionError } from '../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionError';

export const getExecutionError = (actionError: ActionError): ExecutionError => {
  if (typeof actionError.kind === 'object') {
    if ('AccountAlreadyExists' in actionError.kind)
      return {
        kind: 'CreateAccount.AlreadyExist',
        context: {
          accountId: actionError.kind.AccountAlreadyExists.accountId,
          executionStepIndex: actionError.index ?? 0,
        },
      };
  }

  throw new Error('Unknown execution error');
};
