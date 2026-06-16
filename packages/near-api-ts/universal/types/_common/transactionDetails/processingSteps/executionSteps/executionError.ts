import type { AccountId } from '../../../common';
import type { NearToken } from '../../../nearToken';

/**
 * nearcore ActionErrorKind to NAT ExecutionError map
 *
 * AccountDoesNotExist -> Executor.NotFound \
 * LackBalanceForState -> Executor.StorageDeposit.TooLow
 *
 * AccountAlreadyExists -> CreateAccount.AlreadyExist \
 * CreateAccountOnlyByRegistrar -> CreateAccount.TopLevelNamespace \
 * CreateAccountNotAllowed -> CreateAccount.ForeignNamespace \
 * OnlyImplicitAccountCreationAllowed -> CreateAccount.ImplicitAccount
 */

interface CreateAccountErrorRegistry {
  'CreateAccount.AlreadyExist': { newAccountId: AccountId };
  'CreateAccount.TopLevelNamespace': {
    newAccountId: AccountId;
    creatorAccountId: AccountId;
    registrarAccountId: AccountId;
  };
  'CreateAccount.ForeignNamespace': { newAccountId: AccountId; creatorAccountId: AccountId };
  'CreateAccount.ImplicitAccount': { newAccountId: AccountId };
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
