import type { NatError } from '../../../../src/_common/natError';
import type { AccountId, CryptoHash, TransactionNonce, Result } from '../../../_common/common';
import type { PublicKey, Signature } from '../../../_common/crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { TransactionErrorContext } from '../../../_common/transaction/rpcTransactionErrorContext';
import type { ExecutedFinal } from '../../../_common/transactionDetails/_common';
import type { ActionSummaries } from '../../../_common/transactionDetails/actionSummaries';
import type { ExecutionOutcome } from '../../../_common/transactionDetails/executionOutcome';
import type { ExecutionTrace } from '../../../_common/transactionDetails/executionTrace';
import type { ClientContext } from '../../client';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../transport/sendRequest';
import type { TransportPolicy } from '../../transport/transport';

export interface GetTransactionResultPublicErrorRegistry {
  'Client.GetTransactionResult.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetTransactionResult.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetTransactionResult.Timeout': TimeoutErrorContext;
  'Client.GetTransactionResult.Aborted': AbortedErrorContext;
  'Client.GetTransactionResult.Exhausted': ExhaustedErrorContext;
  'Client.GetTransactionResult.Rpc.Transaction.NotFound': TransactionErrorContext['NotFound'];
  'Client.GetTransactionResult.Rpc.Transaction.NotCompleted': TransactionErrorContext['NotCompleted'];
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

export type GetTransactionResultArgs = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: TransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetTransactionResultOutput = {
  transactionHash: CryptoHash;
  processingStage: ExecutedFinal;
  executionOutcome: ExecutionOutcome;
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  nonce: TransactionNonce;
  actionSummaries: ActionSummaries;
  receiverAccountId: AccountId;
  signature: Signature;
  executionTrace: ExecutionTrace;
};

export type GetTransactionResultError =
  | NatError<'Client.GetTransactionResult.Args.InvalidSchema'>
  | NatError<'Client.GetTransactionResult.PreferredRpc.NotFound'>
  | NatError<'Client.GetTransactionResult.Timeout'>
  | NatError<'Client.GetTransactionResult.Aborted'>
  | NatError<'Client.GetTransactionResult.Exhausted'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotFound'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotCompleted'>
  | NatError<'Client.GetTransactionResult.Internal'>;

export type SafeGetTransactionResult = (
  args: GetTransactionResultArgs,
) => Promise<Result<GetTransactionResultOutput, GetTransactionResultError>>;

export type GetTransactionResult = (
  args: GetTransactionResultArgs,
) => Promise<GetTransactionResultOutput>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
