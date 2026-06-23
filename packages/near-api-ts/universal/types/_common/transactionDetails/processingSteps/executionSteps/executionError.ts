import type { AccountId } from '../../../common';
import type { PublicKey } from '../../../crypto';
import type { NearToken } from '../../../nearToken';

/**
 * nearcore ActionErrorKind to NAT ExecutionError map
 *
 * AccountDoesNotExist -> Executor.NotFound
 * LackBalanceForState -> Executor.NotEnoughBalance
 * ActorNoPermission -> Action.Forbidden
 *
 * AccountAlreadyExists -> Action.CreateAccount.AlreadyExists
 * CreateAccountOnlyByRegistrar -> Action.CreateAccount.TopLevelNamespace
 * CreateAccountNotAllowed -> Action.CreateAccount.ForeignNamespace
 * OnlyImplicitAccountCreationAllowed -> Action.CreateAccount.ImplicitAccount
 *
 * AddKeyAlreadyExists -> Action.AddKey.AlreadyExists
 *
 * InsufficientStake -> Action.Stake.BelowThreshold
 * TriesToStake ->  Action.Stake.NotEnoughBalance
 * TriesToUnstake ->  Action.Action.Stake.NotFound
 *
 * DeleteKeyDoesNotExist -> Action.DeleteKey.NotFound
 *
 * DeleteAccountStaking -> Action.DeleteAccount.Staking
 * DeleteAccountWithLargeState -> Action.DeleteAccount.LargeState
 */

interface GeneralExecutionErrorRegistry {
  'Executor.NotFound': { executorAccountId: AccountId };
  'Executor.NotEnoughBalance': { executorAccountId: AccountId; missingAmount: NearToken };
  'Action.Forbidden': { stepCreatorAccountId: AccountId; executorAccountId: AccountId };
}

interface CreateAccountErrorRegistry {
  'Action.CreateAccount.AlreadyExists': { newAccountId: AccountId };
  'Action.CreateAccount.TopLevelNamespace': {
    newAccountId: AccountId;
    creatorAccountId: AccountId;
    registrarAccountId: AccountId; // TODO Remove
  };
  'Action.CreateAccount.ForeignNamespace': { newAccountId: AccountId; creatorAccountId: AccountId };
  'Action.CreateAccount.ImplicitAccount': { newAccountId: AccountId };
}

interface AddKeyErrorRegistry {
  'Action.AddKey.AlreadyExists': { accountId: AccountId; publicKey: PublicKey };
}

interface FunctionCallErrorRegistry {
  'Action.FunctionCall.Wasm.NotFound': { contractAccountId: AccountId };
  'Action.FunctionCall.Compilation.Failed': { cause: string };
  'Action.FunctionCall.Function.NotFound': null;
  'Action.FunctionCall.Function.InvalidSignature': null;
  'Action.FunctionCall.Execution.Failed': { cause: string };
}

interface StakeErrorRegistry {
  'Action.Stake.BelowThreshold': {
    accountId: AccountId;
    proposedStake: NearToken;
    minimumStake: NearToken;
  };
  'Action.Stake.NotEnoughBalance': {
    accountId: AccountId;
    proposedStake: NearToken;
    totalBalance: NearToken;
    missingAmount: NearToken;
  };
  'Action.Stake.NotFound': { accountId: AccountId };
}

interface DeleteKeyErrorRegistry {
  'Action.DeleteKey.NotFound': { accountId: AccountId; publicKey: PublicKey };
}

interface DeleteAccountErrorRegistry {
  'Action.DeleteAccount.Staking': { accountId: AccountId };
  'Action.DeleteAccount.LargeState': { accountId: AccountId };
}

export interface ExecutionErrorRegistry
  extends GeneralExecutionErrorRegistry,
    CreateAccountErrorRegistry,
    AddKeyErrorRegistry,
    FunctionCallErrorRegistry,
    StakeErrorRegistry,
    DeleteKeyErrorRegistry,
    DeleteAccountErrorRegistry {}

export type ExecutionErrorKind = keyof ExecutionErrorRegistry;

export type ExecutionError<K extends ExecutionErrorKind = ExecutionErrorKind> = K extends K
  ? { kind: K; context: ExecutionErrorRegistry[K] }
  : never;
