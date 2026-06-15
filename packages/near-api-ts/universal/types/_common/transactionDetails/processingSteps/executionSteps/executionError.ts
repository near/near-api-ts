import type { Prettify } from '../../../../utils';
import type { AccountId, CryptoHash } from '../../../common';
import type { NearToken } from '../../../nearToken';

/**
 * nearcore ActionErrorKind to NAT ExecutionError map
 *
 * AccountDoesNotExist -> Executor.NotFound
 * LackBalanceForState -> Executor.StorageDeposit.TooLow
 * AccountAlreadyExists -> CreateAccount.AlreadyExist
 *
 */

interface CreateAccountErrorRegistry {
  'CreateAccount.AlreadyExist': { accountId: AccountId };
}

interface ExecutorErrorRegistry {
  'Executor.NotFound': { accountId: AccountId };
  'Executor.StorageDeposit.TooLow': { accountId: AccountId; missingAmount: NearToken };
}

export interface ExecutionErrorRegistry extends ExecutorErrorRegistry, CreateAccountErrorRegistry {}

export type ExecutionErrorKind = keyof ExecutionErrorRegistry;

export type ExecutionError<K extends ExecutionErrorKind = ExecutionErrorKind> = K extends K
  ? { kind: K; context: ExecutionErrorRegistry[K] }
  : never;

// export type ExecutionError = {
//   [K in ExecutionErrorKind]: {
//     kind: K;
//     context: Prettify<{ executionStepIndex: number } & ExecutionErrorRegistry[K]>;
//   };
// }[ExecutionErrorKind];
