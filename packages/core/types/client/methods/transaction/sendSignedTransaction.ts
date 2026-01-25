import type { ClientContext } from 'nat-types/client/client';
import type { SignedTransaction } from 'nat-types/transaction';
import type { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import type { TransportPolicy } from 'nat-types/client/transport/transport';
import type { CommonRpcMethodErrorVariant } from 'nat-types/client/methods/_common/common';
import type { AccountId, Nonce, Result } from 'nat-types/_common/common';
import type { NatError } from '@common/natError';
import type { RpcResponse } from '@common/schemas/zod/rpc';
import type { SharedTransactionErrorVariant } from 'nat-types/_common/sharedTransactionErrors';

export type SendSignedTransactionErrorVariant =
  // Internal
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Action.InvalidIndex`;
      context: {
        rpcResponse: RpcResponse;
      };
    }
  // Public
  | CommonRpcMethodErrorVariant<'Client.SendSignedTransaction'>
  | SharedTransactionErrorVariant<'Client.SendSignedTransaction'>
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Expired`;
      context: null;
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid`;
      context: {
        transactionNonce: Nonce; // transactionNonce must be > than accessKeyNonce
        accessKeyNonce: Nonce;
      };
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound`;
      context: {
        signerAccountId: AccountId;
      };
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid`;
      context: null;
    };

export type SendSignedTransactionInternalErrorKind =
  'Client.SendSignedTransaction.Internal';

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
  | NatError<'Client.SendSignedTransaction.SendRequest.Failed'>
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
