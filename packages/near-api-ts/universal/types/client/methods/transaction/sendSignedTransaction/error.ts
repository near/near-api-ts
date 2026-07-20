import type { NatError } from '../../../../../src/_common/natError';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../../_common/natError';
import type { TransactionErrorContext } from '../../../../_common/transaction/rpcTransactionErrorContext';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../../transport/sendRequest';
import type { TransactionDetailsInnerErrorRegistry } from '../_common/innerErrorRegistry';

export interface SendSignedTransactionPublicErrorRegistry {
  'Client.SendSignedTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.SendSignedTransaction.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.SendSignedTransaction.Timeout': TimeoutErrorContext;
  'Client.SendSignedTransaction.Aborted': AbortedErrorContext;
  'Client.SendSignedTransaction.Exhausted': ExhaustedErrorContext;
  'Client.SendSignedTransaction.Rpc.Transaction.Expired': TransactionErrorContext['Expired'];
  'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid': TransactionErrorContext['Nonce']['Invalid'];
  // TODO: Signer.NotEnoughBalance
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
  'Client.SendSignedTransaction.DeserializeResultData.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeResultData.Failed'];
  'Client.SendSignedTransaction.DeserializeActionSummaries.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'];
  'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'];
  'Client.SendSignedTransaction.Internal': InternalErrorContext;
}

export type SendSignedTransactionError =
  | NatError<'Client.SendSignedTransaction.Args.InvalidSchema'>
  | NatError<'Client.SendSignedTransaction.PreferredRpc.NotFound'>
  | NatError<'Client.SendSignedTransaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Aborted'>
  | NatError<'Client.SendSignedTransaction.Exhausted'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Expired'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.BelowThreshold'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.NotFound'>
  | NatError<'Client.SendSignedTransaction.DeserializeResultData.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeActionSummaries.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed'>
  | NatError<'Client.SendSignedTransaction.Internal'>;
