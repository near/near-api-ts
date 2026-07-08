import type { AccountId } from '../../../common';
import type { PublicKey } from '../../../crypto';
import type { NearToken } from '../../../nearToken';

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
    registrarAccountId: AccountId;
  };
  'Action.CreateAccount.ForeignNamespace': { newAccountId: AccountId; creatorAccountId: AccountId };
  'Action.CreateAccount.ImplicitAccount': { newAccountId: AccountId };
}

interface AddKeyErrorRegistry {
  'Action.AddKey.AlreadyExists': { accountId: AccountId; publicKey: PublicKey };
}

interface FunctionCallErrorRegistry {
  'Action.FunctionCall.Wasm.NotFound': { contractAccountId: AccountId };
  'Action.FunctionCall.Function.NotFound': null;
  'Action.FunctionCall.Compilation.Failed': { cause: string };
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
