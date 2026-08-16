import type {
  AccountId,
  ContractFunctionName,
  TransactionNonce,
} from '../../../../../../../_common/common';
import type { PublicKey } from '../../../../../../../_common/crypto';
import type { NearGas } from '../../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../../_common/nearToken';

interface GeneralConversionErrorRegistry {
  'Nonce.Invalid': { transactionNonce: TransactionNonce; accessKeyNonce: TransactionNonce };
  'Signature.Invalid': null;
  'BlockHash.Expired': null;
  'TransactionCost.Overflow': null;
}

interface SignerErrorRegistry {
  'Signer.NotFound': { signerAccountId: AccountId };
  'Signer.Budget.NotEnough': { signerAccountId: AccountId; minimalMissingAmount: NearToken };
  'Signer.AccessKey.NotFound': { signerAccountId: AccountId; signerPublicKey: PublicKey };
  'Signer.AccessKey.NotFullAccess': null;
  'Signer.AccessKey.Receiver.NotAllowed': {
    transactionReceiverAccountId: AccountId;
    allowedContractAccountId: AccountId;
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
  'Actions.TooMany': { actionsCount: number; maximumActionsCount: number };
  'Actions.DeployContract.TooMany': {
    deployContractActionsCount: number;
    maximumDeployContractActionsCount: number;
  };
  'Actions.FunctionCall.TotalGasLimit.Exceeded': {
    totalGasLimit: NearGas;
    maximumTotalGasLimit: NearGas;
  };
  'Actions.FunctionCall.TotalGasLimit.Overflow': null;
}

interface ActionValidationErrorRegistry {
  'Action.FunctionCall.FunctionName.TooLong': {
    functionNameLength: number;
    maximumFunctionNameLength: number;
  };
  'Action.FunctionCall.ZeroGasLimit': null;
  'Action.AddKey.AllowedFunctions.FunctionName.TooLong': {
    functionNameLength: number;
    maximumFunctionNameLength: number;
  };
  // Not just the bytes of the names: nearcore counts one terminator byte per name on top, so
  // totalSizeBytes is the sum of their lengths plus their count.
  'Action.AddKey.AllowedFunctions.TotalSize.Exceeded': {
    totalSizeBytes: number;
    maximumTotalSizeBytes: number;
  };
  // Two ways to be invalid: the key isn't ed25519 at all, or it is one whose bytes don't
  // decompress to a torsion-free point, so nearcore can't convert it to ristretto.
  'Action.Stake.ValidatorKey.Invalid': { validatorPublicKey: PublicKey };
  'Action.DeleteAccount.NotFinal': null;
}

interface ConversionFailureRegistry
  extends GeneralConversionErrorRegistry,
    SignerErrorRegistry,
    ActionsValidationErrorRegistry,
    ActionValidationErrorRegistry {}

export type ConversionFailureKind = keyof ConversionFailureRegistry;

export type ConversionFailureError<K extends ConversionFailureKind = ConversionFailureKind> =
  K extends K ? { kind: K; context: ConversionFailureRegistry[K] } : never;
