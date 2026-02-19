import type { ClientContext } from '../../client';
import type { SignedTransaction } from '../../../_common/transaction/transaction';
import type { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import type { TransportPolicy } from '../../transport/transport';
import type { Result } from '../../../_common/common';
import type { NatError } from '../../../../src/_common/natError';
import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '@universal/types/natError';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '@universal/types/client/transport/sendRequest';
import type { TransactionErrorContext } from '@universal/types/_common/transaction/rpcTransactionErrorContext';

export interface SendSignedTransactionPublicErrorRegistry {
  'Client.SendSignedTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  //
  'Client.SendSignedTransaction.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.SendSignedTransaction.Timeout': TimeoutErrorContext;
  'Client.SendSignedTransaction.Aborted': AbortedErrorContext;
  'Client.SendSignedTransaction.Exhausted': ExhaustedErrorContext;
  // TODO move to Inner?
  'Client.SendSignedTransaction.Rpc.Transaction.Action.InvalidIndex': TransactionErrorContext['Action']['InvalidIndex'];
  //
  'Client.SendSignedTransaction.Rpc.Transaction.Expired': TransactionErrorContext['Expired'];
  'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid': TransactionErrorContext['Nonce']['Invalid'];
  'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow': TransactionErrorContext['Signer']['Balance']['TooLow'];
  'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound': TransactionErrorContext['Signer']['NotFound'];
  'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid': TransactionErrorContext['Signature']['Invalid'];
  'Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound': TransactionErrorContext['Receiver']['NotFound'];
  'Client.SendSignedTransaction.Rpc.Transaction.Timeout': TransactionErrorContext['Timeout'];
  //
  'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist': TransactionErrorContext['Action']['CreateAccount']['AlreadyExist'];
  'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.BelowThreshold': TransactionErrorContext['Action']['Stake']['BelowThreshold'];
  'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow': TransactionErrorContext['Action']['Stake']['Balance']['TooLow'];
  'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.NotFound': TransactionErrorContext['Action']['Stake']['NotFound'];
  //
  'Client.SendSignedTransaction.Internal': InternalErrorContext;
}

export type SendSignedTransactionArgs = {
  signedTransaction: SignedTransaction;
  policies?: {
    transport?: TransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type SendSignedTransactionOutput = {
  rawRpcResult: RpcTransactionResponse; // TODO Tx without Failure
};

export type SendSignedTransactionError =
  | NatError<'Client.SendSignedTransaction.Args.InvalidSchema'>
  // SendRequest
  | NatError<'Client.SendSignedTransaction.PreferredRpc.NotFound'>
  | NatError<'Client.SendSignedTransaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Aborted'>
  | NatError<'Client.SendSignedTransaction.Exhausted'>
  // RPC - transaction
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Expired'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid'>
  // RPC - shared with signer.executeTransaction
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.BelowThreshold'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.NotFound'>
  // Stub
  | NatError<'Client.SendSignedTransaction.Internal'>;

export type SafeSendSignedTransaction = (
  args: SendSignedTransactionArgs,
) => Promise<Result<SendSignedTransactionOutput, SendSignedTransactionError>>;

export type SendSignedTransaction = (
  args: SendSignedTransactionArgs,
) => Promise<SendSignedTransactionOutput>;

export type CreateSafeSendSignedTransaction = (
  clientContext: ClientContext,
) => SafeSendSignedTransaction;
