import type { AccountId } from '../../../common';
import type { PublicKey } from '../../../crypto';
import type { NearToken } from '../../../nearToken';

/**
 * nearcore ActionErrorKind to NAT ExecutionError map
 *
 * AccountDoesNotExist -> Executor.NotFound
 * LackBalanceForState -> Executor.NotEnoughBalance
 *
 * ActorNoPermission -> Action.Forbidden
 *
 * AccountAlreadyExists -> Action.CreateAccount.AlreadyExist
 * CreateAccountOnlyByRegistrar -> Action.CreateAccount.TopLevelNamespace
 * CreateAccountNotAllowed -> Action.CreateAccount.ForeignNamespace
 * OnlyImplicitAccountCreationAllowed -> Action.CreateAccount.ImplicitAccount
 *
 * InsufficientStake -> Action.Stake.BelowThreshold
 * TriesToStake ->  Action.Stake.NotEnoughBalance
 * TriesToUnstake ->  Action.Action.Stake.NotFound
 *
 * DeleteKeyDoesNotExist -> Action.DeleteKey.NotFound
 */

interface GeneralExecutionErrorRegistry {
  'Executor.NotFound': { executorAccountId: AccountId };
  'Executor.NotEnoughBalance': { executorAccountId: AccountId; missingAmount: NearToken };
  'Action.Forbidden': { stepCreatorAccountId: AccountId; executorAccountId: AccountId };
}

interface CreateAccountErrorRegistry {
  'Action.CreateAccount.AlreadyExist': { newAccountId: AccountId };
  'Action.CreateAccount.TopLevelNamespace': {
    newAccountId: AccountId;
    creatorAccountId: AccountId;
    registrarAccountId: AccountId;
  };
  'Action.CreateAccount.ForeignNamespace': { newAccountId: AccountId; creatorAccountId: AccountId };
  'Action.CreateAccount.ImplicitAccount': { newAccountId: AccountId };
}

interface StakeErrorRegistry {
  'Action.Stake.BelowThreshold': {
    validatorAccountId: AccountId;
    proposedStake: NearToken;
    minimumStake: NearToken;
  };
  'Action.Stake.NotEnoughBalance': {
    validatorAccountId: AccountId;
    proposedStake: NearToken;
    totalBalance: NearToken;
    missingAmount: NearToken;
  };
  'Action.Stake.NotFound': { validatorAccountId: AccountId };
}

interface DeleteKeyErrorRegistry {
  'Action.DeleteKey.NotFound': { accountId: AccountId; publicKey: PublicKey };
}

export interface ExecutionErrorRegistry
  extends GeneralExecutionErrorRegistry,
    CreateAccountErrorRegistry,
    StakeErrorRegistry,
    DeleteKeyErrorRegistry {}

export type ExecutionErrorKind = keyof ExecutionErrorRegistry;

export type ExecutionError<K extends ExecutionErrorKind = ExecutionErrorKind> = K extends K
  ? { kind: K; context: ExecutionErrorRegistry[K] }
  : never;
