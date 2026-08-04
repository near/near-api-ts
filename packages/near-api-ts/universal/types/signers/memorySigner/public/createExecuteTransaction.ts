import type { NatError } from '../../../../src/_common/natError';
import type { Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { TransactionIntent } from '../../../_common/transaction/transaction';
import type { ConversionFailureError } from '../../../_common/transactionDetails/_common/_common/conversionFailureError';
import type { ExecutionFailureError } from '../../../_common/transactionDetails/_common/_common/executionFailureError';
import type { SendSignedTransactionOutput } from '../../../client/methods/transaction/sendSignedTransaction/output';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../../client/transport/sendRequest';
import type { MemorySignerErrorContext } from '../_common/errorContext';
import type { MemorySignerContext } from '../memorySigner';

export interface ExecuteTransactionPublicErrorRegistry {
  'MemorySigner.ExecuteTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemorySigner.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded': MemorySignerErrorContext['KeyPool']['AccessKeys']['NotLoaded'];
  'MemorySigner.ExecuteTransaction.KeyPool.Empty': MemorySignerErrorContext['KeyPool']['Empty'];
  'MemorySigner.ExecuteTransaction.KeyPool.SigningKey.NotFound': MemorySignerErrorContext['KeyPool']['SigningKey']['NotFound'];
  'MemorySigner.ExecuteTransaction.TaskQueue.Timeout': MemorySignerErrorContext['TaskQueue']['Timeout'];
  //
  'MemorySigner.ExecuteTransaction.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'MemorySigner.ExecuteTransaction.Timeout': TimeoutErrorContext;
  'MemorySigner.ExecuteTransaction.Aborted': AbortedErrorContext;
  'MemorySigner.ExecuteTransaction.Exhausted': ExhaustedErrorContext;

  'MemorySigner.ExecuteTransaction.Rpc.Timeout': null;
  'MemorySigner.ExecuteTransaction.Rpc.TransactionCost.NotCovered': ConversionFailureError<'TransactionCost.NotCovered'>['context'];

  'MemorySigner.ExecuteTransaction.Rpc.Action.CreateAccount.AlreadyExists': ExecutionFailureError<'Action.CreateAccount.AlreadyExists'>['context'];
  'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.BelowThreshold': ExecutionFailureError<'Action.Stake.BelowThreshold'>['context'];
  'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.TotalBalance.NotEnough': ExecutionFailureError<'Action.Stake.TotalBalance.NotEnough'>['context'];
  'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.NotFound': ExecutionFailureError<'Action.Stake.NotFound'>['context'];

  'MemorySigner.ExecuteTransaction.Internal': InternalErrorContext;
}

type ExecuteTransactionArgs = {
  intent: TransactionIntent;
};

type ExecuteTransactionError =
  | NatError<'MemorySigner.ExecuteTransaction.Args.InvalidSchema'>
  | NatError<'MemorySigner.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.ExecuteTransaction.KeyPool.Empty'>
  | NatError<'MemorySigner.ExecuteTransaction.KeyPool.SigningKey.NotFound'>
  | NatError<'MemorySigner.ExecuteTransaction.TaskQueue.Timeout'>
  // SendRequest
  | NatError<'MemorySigner.ExecuteTransaction.PreferredRpc.NotFound'>
  | NatError<'MemorySigner.ExecuteTransaction.Timeout'>
  | NatError<'MemorySigner.ExecuteTransaction.Aborted'>
  | NatError<'MemorySigner.ExecuteTransaction.Exhausted'>
  // RPC errors
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.TransactionCost.NotCovered'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Timeout'>
  // // Rpc transaction action errors
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Action.CreateAccount.AlreadyExists'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.BelowThreshold'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.TotalBalance.NotEnough'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.NotFound'>
  // Stub
  | NatError<'MemorySigner.ExecuteTransaction.Internal'>;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<SendSignedTransactionOutput, ExecuteTransactionError>>;

export type ExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<SendSignedTransactionOutput>;

export type CreateSafeExecuteTransaction = (context: MemorySignerContext) => SafeExecuteTransaction;
