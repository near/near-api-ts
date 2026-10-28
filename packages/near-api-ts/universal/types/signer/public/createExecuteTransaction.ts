import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../_common/natError';
import type { TransactionIntent } from '../../_common/transaction/transaction';
import type {
  ConversionFailureError,
  ConversionFailureKind,
} from '../../client/methods/transaction/_common/transactionDetails/_common/_common/conversionFailureError';
import type { ExecutionFailure } from '../../client/methods/transaction/_common/transactionDetails/executionFailure';
import type { SendSignedTransactionOutput } from '../../client/methods/transaction/sendSignedTransaction/output';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../client/transport/sendRequest';
import type { SignerErrorContext } from '../_common/errorContext';
import type { SignerContext } from '../signer';

// TODO Temporary
// `executeTransaction` forwards these straight from `client.sendSignedTransaction`:
// `repackError` only swaps the kind prefix and passes the context through untouched,
// so the contexts below are the ones that method builds.

// A conversion failure keeps its own context under `info`, next to the transaction the
// node turned down.
type ConversionFailureContext<CF extends ConversionFailureKind> = {
  info: ConversionFailureError<CF>['context'];
  signedTransactionBorsh64: Base64String;
};

// TODO Temporary
// An execution failure carries the whole transaction details instead - its `error` field
// holds the failure itself. The signer always sends with the default processing stage and
// without deserializers, so unlike the client registry this can name the details' shape.
type ExecutionFailureContext = {
  transactionDetails: ExecutionFailure<'Live'>['ExecutedOptimistic'];
  signedTransactionBorsh64: Base64String;
};

export interface ExecuteTransactionPublicErrorRegistry {
  'Signer.ExecuteTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Signer.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded': SignerErrorContext['KeyPool']['AccessKeys']['NotLoaded'];
  'Signer.ExecuteTransaction.KeyPool.Empty': SignerErrorContext['KeyPool']['Empty'];
  'Signer.ExecuteTransaction.KeyPool.SigningKey.NotFound': SignerErrorContext['KeyPool']['SigningKey']['NotFound'];
  'Signer.ExecuteTransaction.TaskQueue.Timeout': SignerErrorContext['TaskQueue']['Timeout'];
  //
  'Signer.ExecuteTransaction.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Signer.ExecuteTransaction.Timeout': TimeoutErrorContext;
  'Signer.ExecuteTransaction.Aborted': AbortedErrorContext;
  'Signer.ExecuteTransaction.Exhausted': ExhaustedErrorContext;

  'Signer.ExecuteTransaction.Rpc.Timeout': null;
  'Signer.ExecuteTransaction.Rpc.Signer.Budget.NotEnough': ConversionFailureContext<'Signer.Budget.NotEnough'>;

  'Signer.ExecuteTransaction.Rpc.Action.CreateSubAccount.AlreadyExists': ExecutionFailureContext;
  'Signer.ExecuteTransaction.Rpc.Action.Stake.ProposedStake.BelowThreshold': ExecutionFailureContext;
  'Signer.ExecuteTransaction.Rpc.Action.Stake.TotalBalance.NotEnough': ExecutionFailureContext;
  'Signer.ExecuteTransaction.Rpc.Action.Stake.ValidatorStake.AlreadyZero': ExecutionFailureContext;

  'Signer.ExecuteTransaction.Internal': InternalErrorContext;
}

type ExecuteTransactionArgs = {
  intent: TransactionIntent;
};

type ExecuteTransactionError =
  | NatError<'Signer.ExecuteTransaction.Args.InvalidSchema'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.Empty'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.SigningKey.NotFound'>
  | NatError<'Signer.ExecuteTransaction.TaskQueue.Timeout'>
  // SendRequest
  | NatError<'Signer.ExecuteTransaction.PreferredRpc.NotFound'>
  | NatError<'Signer.ExecuteTransaction.Timeout'>
  | NatError<'Signer.ExecuteTransaction.Aborted'>
  | NatError<'Signer.ExecuteTransaction.Exhausted'>
  // RPC errors
  | NatError<'Signer.ExecuteTransaction.Rpc.Signer.Budget.NotEnough'>
  | NatError<'Signer.ExecuteTransaction.Rpc.Timeout'>
  // // Rpc transaction action errors
  | NatError<'Signer.ExecuteTransaction.Rpc.Action.CreateSubAccount.AlreadyExists'>
  | NatError<'Signer.ExecuteTransaction.Rpc.Action.Stake.ProposedStake.BelowThreshold'>
  | NatError<'Signer.ExecuteTransaction.Rpc.Action.Stake.TotalBalance.NotEnough'>
  | NatError<'Signer.ExecuteTransaction.Rpc.Action.Stake.ValidatorStake.AlreadyZero'>
  // Stub
  | NatError<'Signer.ExecuteTransaction.Internal'>;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<SendSignedTransactionOutput, ExecuteTransactionError>>;

export type ExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<SendSignedTransactionOutput>;

export type CreateSafeExecuteTransaction = (context: SignerContext) => SafeExecuteTransaction;
