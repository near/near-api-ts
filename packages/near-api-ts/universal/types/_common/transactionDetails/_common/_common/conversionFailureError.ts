import type { ShardId } from '@near-js/jsonrpc-types';
import type { AccountId, ContractFunctionName, TransactionNonce } from '../../../common';
import type { PublicKey } from '../../../crypto';
import type { NearGas } from '../../../nearGas';
import type { NearToken } from '../../../nearToken';

// The transaction as a whole: whatever the signer put into a top level field of it.
interface GeneralConversionErrorRegistry {
  'Signer.NotFound': { signerAccountId: AccountId };
  'Signer.StorageUsage.NotCovered': { signerAccountId: AccountId; missingAmount: NearToken };
  'Nonce.Invalid': { transactionNonce: TransactionNonce; accessKeyNonce: TransactionNonce };
  'Signature.Invalid': null;
  Expired: null; // TODO rename
  'BlockHash.NotOnChain': null;
  'TransactionCost.Overflow': null;
  'TransactionCost.NotCovered': {
    signerAccountId: AccountId;
    transactionCost: NearToken;
    minimalMissingAmount: NearToken;
  };
}

// The access key the transaction is signed with doesn't permit what the transaction asks for.
interface SignerKeyErrorRegistry {
  'SignerKey.NotFound': { signerAccountId: AccountId; signerPublicKey: PublicKey };
  'SignerKey.FullAccessRequired': null;
  'SignerKey.ReceiverMismatch': {
    transactionReceiverAccountId: AccountId;
    accessKeyContractAccountId: AccountId;
  };
  'SignerKey.Function.NotAllowed': { functionName: ContractFunctionName };
  'SignerKey.AttachedDeposit.NotAllowed': null;
  'SignerKey.GasBudget.NotEnough': {
    signerAccountId: AccountId;
    signerPublicKey: PublicKey;
    gasBudget: NearToken;
    transactionCost: NearToken;
  };
}

// The action list as a whole — no single action is to blame.
interface ActionsValidationErrorRegistry {
  'Actions.CountExceeded': { actionsCount: number; maximumActionsCount: number };
  'Actions.DeployContract.CountExceeded': {
    deployContractActionsCount: number;
    maximumDeployContractActionsCount: number;
  };
  'Actions.TotalGasLimit.Exceeded': { totalGasLimit: NearGas; maximumTotalGasLimit: NearGas };
  'Actions.TotalGasLimit.Overflow': null;
}

// One action of the list, under the same `Action.<Kind>.*` prefix its execution errors use.
interface ActionValidationErrorRegistry {
  'Action.DeleteAccount.NotFinal': null;
  'Action.FunctionCall.ZeroGasLimit': null;
  'Action.AddKey.AllowedFunctionsSizeExceeded': {
    allowedFunctionsSizeBytes: number;
    maximumAllowedFunctionsSizeBytes: number;
  };
  'Action.Stake.InvalidValidatorKey': { validatorPublicKey: PublicKey };
}

// Nothing is wrong with the transaction — the receiver shard can't take it right now.
interface ShardErrorRegistry {
  'Shard.Congested': { shardId: ShardId; congestionLevel: number };
  'Shard.Stuck': { shardId: ShardId; missedChunksCount: number };
}

interface ConversionFailureRegistry
  extends GeneralConversionErrorRegistry,
    SignerKeyErrorRegistry,
    ActionsValidationErrorRegistry,
    ActionValidationErrorRegistry,
    ShardErrorRegistry {}

export type ConversionFailureKind = keyof ConversionFailureRegistry;

export type ConversionFailureError<K extends ConversionFailureKind = ConversionFailureKind> =
  K extends K ? { kind: K; context: ConversionFailureRegistry[K] } : never;

/*
 // 'Signer.AvailableBalance.NotEnough': {
  //   signerAccountId: AccountId;
  //   transactionCost: NearToken;
  //   minimalMissingAmount: NearToken;
  // };
 */
