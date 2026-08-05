import type { ShardId } from '@near-js/jsonrpc-types';
import type { AccountId, ContractFunctionName, TransactionNonce } from '../../../common';
import type { PublicKey } from '../../../crypto';
import type { NearGas } from '../../../nearGas';
import type { NearToken } from '../../../nearToken';

interface GeneralConversionErrorRegistry {
  'Nonce.Invalid': { transactionNonce: TransactionNonce; accessKeyNonce: TransactionNonce };
  'Signature.Invalid': null;
  'BlockHash.Expired': null;
  'BlockHash.NotAncestor': null;
  'TransactionCost.Overflow': null;
  'TransactionCost.NotCovered': /*TODO or Signer.AvailableBalance.NotEnough ?*/ {
    signerAccountId: AccountId;
    transactionCost: NearToken;
    minimalMissingAmount: NearToken;
  };
}

interface SignerErrorRegistry {
  'Signer.NotFound': { signerAccountId: AccountId };
  'Signer.StorageUsage.NotCovered': { signerAccountId: AccountId; missingAmount: NearToken };
  'Signer.AccessKey.NotFound': { signerAccountId: AccountId; signerPublicKey: PublicKey };
  'Signer.AccessKey.NotFullAccess': null;
  'Signer.AccessKey.Receiver.NotAllowed': {
    transactionReceiverAccountId: AccountId;
    accessKeyContractAccountId: AccountId;
  };
  'Signer.AccessKey.Function.NotAllowed': { functionName: ContractFunctionName };
  'Signer.AccessKey.AttachedDeposit.NotAllowed': null; // TODO maybe AttachedPayment is a better name?
  'Signer.AccessKey.GasBudget.NotEnough': /* TODO: could have problems with GasBudget cuz GasKey?*/ {
    signerAccountId: AccountId;
    signerPublicKey: PublicKey;
    gasBudget: NearToken;
    transactionCost: NearToken;
  };
}

interface ActionsValidationErrorRegistry {
  'Actions.CountExceeded': { actionsCount: number; maximumActionsCount: number };
  'Actions.DeployContract.CountExceeded': {
    deployContractActionsCount: number;
    maximumDeployContractActionsCount: number;
  };
  'Actions.TotalGasLimit.Exceeded': { totalGasLimit: NearGas; maximumTotalGasLimit: NearGas };
  'Actions.TotalGasLimit.Overflow': null;
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
    SignerErrorRegistry,
    ActionsValidationErrorRegistry,
    ShardErrorRegistry {}

export type ConversionFailureKind = keyof ConversionFailureRegistry;

export type ConversionFailureError<K extends ConversionFailureKind = ConversionFailureKind> =
  K extends K ? { kind: K; context: ConversionFailureRegistry[K] } : never;
