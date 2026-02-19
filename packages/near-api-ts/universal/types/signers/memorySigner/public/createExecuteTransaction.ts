import type { TransactionIntent } from '../../../_common/transaction/transaction';
import type { NatError } from '../../../../src/_common/natError';
import type { Result } from '../../../_common/common';
import type { MemorySignerContext } from '../memorySigner';
import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '../../../natError';
import type { SendSignedTransactionOutput } from '../../../client/methods/transaction/sendSignedTransaction';
import type { MemorySignerErrorContext } from '@universal/types/signers/memorySigner/_common/errorContext';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '@universal/types/client/transport/sendRequest';
import type { TransactionErrorContext } from '@universal/types/_common/transaction/rpcTransactionErrorContext';

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
  //
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.Signer.Balance.TooLow': TransactionErrorContext['Signer']['Balance']['TooLow'];
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound': TransactionErrorContext['Receiver']['NotFound'];
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.Timeout': TransactionErrorContext['Timeout'];
  //
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist': TransactionErrorContext['Action']['CreateAccount']['AlreadyExist'];
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.BelowThreshold': TransactionErrorContext['Action']['Stake']['BelowThreshold'];
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow': TransactionErrorContext['Action']['Stake']['Balance']['TooLow'];
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.NotFound': TransactionErrorContext['Action']['Stake']['NotFound'];
  //
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
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Signer.Balance.TooLow'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Timeout'>
  // Rpc transaction action errors
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.BelowThreshold'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.NotFound'>
  // Stub
  | NatError<'MemorySigner.ExecuteTransaction.Internal'>;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<SendSignedTransactionOutput, ExecuteTransactionError>>;

export type ExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<SendSignedTransactionOutput>;

export type CreateSafeExecuteTransaction = (
  context: MemorySignerContext,
) => SafeExecuteTransaction;
