import type { ActionError } from '@near-js/jsonrpc-types';
import { yoctoNear } from '../../../../../../../../index';
import type { ExecutionError } from '../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionError';

export const getExecutionError = (actionError: ActionError): ExecutionError => {
  if (typeof actionError.kind === 'object') {
    const { kind } = actionError;

    // Executor-related
    if ('AccountDoesNotExist' in kind)
      return {
        kind: 'Executor.NotFound',
        context: { accountId: kind.AccountDoesNotExist.accountId },
      };

    if ('LackBalanceForState' in kind)
      return {
        kind: 'Executor.StorageDeposit.TooLow',
        context: {
          accountId: kind.LackBalanceForState.accountId,
          missingAmount: yoctoNear(kind.LackBalanceForState.amount),
        },
      };

    // CreateAccount action
    if ('AccountAlreadyExists' in kind)
      return {
        kind: 'CreateAccount.AlreadyExist',
        context: { accountId: kind.AccountAlreadyExists.accountId },
      };
  }

  throw new Error('Unknown execution error', { cause: actionError });
};
