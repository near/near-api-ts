import type {
  AccountId,
  ContractFunctionName,
  DelegationNonce,
  TransactionNonce,
} from '../../../../../../../_common/common';
import type { PublicKey } from '../../../../../../../_common/crypto';
import type { NearToken } from '../../../../../../../_common/nearToken';

interface GeneralExecutionErrorRegistry {
  'Executor.NotFound': { executorAccountId: AccountId };
  'Executor.Budget.NotEnough': { executorAccountId: AccountId; minimalMissingAmount: NearToken };
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
  'Action.FunctionCall.ContractWasm.NotFound': { contractAccountId: AccountId };
  'Action.FunctionCall.Function.NotFound': null;
  'Action.FunctionCall.Preparation.Failed': { cause: string };
  'Action.FunctionCall.Execution.Failed': { cause: string };
}

interface StakeErrorRegistry {
  'Action.Stake.ProposedStake.BelowThreshold': {
    accountId: AccountId;
    proposedStake: NearToken;
    minimumStake: NearToken;
  };
  'Action.Stake.TotalBalance.NotEnough': {
    accountId: AccountId;
    proposedStake: NearToken;
    totalBalance: NearToken;
    missingAmount: NearToken;
  };
  'Action.Stake.ValidatorStake.AlreadyZero': { accountId: AccountId };
}

interface DeleteKeyErrorRegistry {
  'Action.DeleteKey.NotFound': { accountId: AccountId; publicKey: PublicKey };
}

interface DeleteAccountErrorRegistry {
  'Action.DeleteAccount.Staking': { accountId: AccountId };
  'Action.DeleteAccount.LargeState': { accountId: AccountId };
}

interface ExecuteDelegationErrorRegistry {
  'Action.ExecuteDelegation.Expired': null;
  'Action.ExecuteDelegation.Signature.Invalid': null;
  'Action.ExecuteDelegation.Nonce.Invalid': {
    delegationNonce: DelegationNonce;
    accessKeyNonce: TransactionNonce;
  };
  'Action.ExecuteDelegation.Nonce.TooLarge': {
    delegationNonce: DelegationNonce;
    maxAllowedNonce: TransactionNonce;
  };
  'Action.ExecuteDelegation.Executor.NotDelegator': {
    executorAccountId: AccountId;
    delegatorAccountId: AccountId;
  };
  // These mirror the `Signer.AccessKey.*` conversion errors except for a `GasBudget.NotEnough`
  // counterpart: the relayer pays for a delegation, so the delegator key's allowance is never
  // checked and nearcore has no way to report it here.
  'Action.ExecuteDelegation.Delegator.AccessKey.NotFound': {
    delegatorAccountId: AccountId;
    delegatorPublicKey: PublicKey;
  };
  'Action.ExecuteDelegation.Delegator.AccessKey.NotFullAccess': null;
  'Action.ExecuteDelegation.Delegator.AccessKey.AttachedDeposit.NotAllowed': null;
  'Action.ExecuteDelegation.Delegator.AccessKey.Receiver.NotAllowed': {
    delegationReceiverAccountId: AccountId;
    allowedContractAccountId: AccountId;
  };
  'Action.ExecuteDelegation.Delegator.AccessKey.Function.NotAllowed': {
    functionName: ContractFunctionName;
  };
}

export interface ExecutionFailureRegistry
  extends GeneralExecutionErrorRegistry,
    CreateAccountErrorRegistry,
    AddKeyErrorRegistry,
    FunctionCallErrorRegistry,
    StakeErrorRegistry,
    DeleteKeyErrorRegistry,
    DeleteAccountErrorRegistry,
    ExecuteDelegationErrorRegistry {}

export type ExecutionFailureKind = keyof ExecutionFailureRegistry;

export type ExecutionFailureError<K extends ExecutionFailureKind = ExecutionFailureKind> =
  K extends K ? { kind: K; context: ExecutionFailureRegistry[K] } : never;
