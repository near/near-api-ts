import type { AccountId, ContractFunctionName, TransactionNonce } from '../../../common';
import type { PublicKey } from '../../../crypto';
import type { NearGas } from '../../../nearGas';
import type { NearToken } from '../../../nearToken';

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

interface ConversionFailureRegistry
  extends GeneralConversionErrorRegistry,
    SignerErrorRegistry,
    ActionsValidationErrorRegistry {}

export type ConversionFailureKind = keyof ConversionFailureRegistry;

export type ConversionFailureError<K extends ConversionFailureKind = ConversionFailureKind> =
  K extends K ? { kind: K; context: ConversionFailureRegistry[K] } : never;
