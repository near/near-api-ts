import type { AccountId } from '../../../common';
import type { PublicKey } from '../../../crypto';
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
 *
 * InsufficientStake -> Stake.BelowThreshold \
 * TriesToStake -> Stake.Balance.TooLow \
 * TriesToUnstake -> Stake.NotFound
 *
 * DeleteKeyDoesNotExist -> DeleteKey.NotFound
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

interface StakeErrorRegistry {
  'Stake.BelowThreshold': {
    accountId: AccountId;
    proposedStake: NearToken;
    minimumStake: NearToken;
  };
  'Stake.Balance.TooLow': {
    accountId: AccountId;
    proposedStake: NearToken;
    totalBalance: NearToken;
    missingAmount: NearToken;
  };
  'Stake.NotFound': { accountId: AccountId };
}

interface DeleteKeyErrorRegistry {
  'DeleteKey.NotFound': { accountId: AccountId; publicKey: PublicKey };
}

export interface ExecutionErrorRegistry
  extends ExecutorErrorRegistry,
    CreateAccountErrorRegistry,
    StakeErrorRegistry,
    DeleteKeyErrorRegistry {}

export type ExecutionErrorKind = keyof ExecutionErrorRegistry;

export type ExecutionError<K extends ExecutionErrorKind = ExecutionErrorKind> = K extends K
  ? { kind: K; context: ExecutionErrorRegistry[K] }
  : never;
