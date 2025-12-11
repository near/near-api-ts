import type { ClientContext } from 'nat-types/client/client';
import type { SignedTransaction } from 'nat-types/transaction';
import type { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import type { TransportPolicy } from 'nat-types/client/transport/transport';
import type { SendRequestErrorVariant } from 'nat-types/client/transport/sendRequest';
import type { CommonRpcMethodErrorVariant } from 'nat-types/client/methods/_common/common';
import type {
  AccountId,
  CryptoHash,
  Nonce,
  Result,
} from 'nat-types/_common/common';
import type { NatError } from '@common/natError';

export type SendSignedTransactionErrorVariant =
  | SendRequestErrorVariant<'Client.SendSignedTransaction'>
  | CommonRpcMethodErrorVariant<'Client.SendSignedTransaction'>
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid`;
      context: {
        // transactionNonce must be > than accessKeyNonce
        transactionNonce: Nonce;
        accessKeyNonce: Nonce;
      };
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Expired`;
      context: null;
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound`;
      context: {
        signerAccountId: AccountId;
      };
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound`;
      context: {
        receiverAccountId: AccountId;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid`;
      context: null;
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist`;
      context: {
        accountId: AccountId;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    }
  | {
      kind: `Client.SendSignedTransaction.Rpc.Timeout`;
      context: null;
    };

export type SendSignedTransactionUnknownErrorKind =
  'Client.SendSignedTransaction.Unknown';

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

type SendSignedTransactionError =
  // Function Arguments
  | NatError<'Client.SendSignedTransaction.Args.InvalidSchema'>
  // Transport
  | NatError<'Client.SendSignedTransaction.PreferredRpc.NotFound'>
  | NatError<'Client.SendSignedTransaction.Request.FetchFailed'>
  | NatError<'Client.SendSignedTransaction.Request.Attempt.Timeout'>
  | NatError<'Client.SendSignedTransaction.Request.Timeout'>
  | NatError<'Client.SendSignedTransaction.Request.Aborted'>
  | NatError<'Client.SendSignedTransaction.Response.JsonParseFailed'>
  | NatError<'Client.SendSignedTransaction.Response.InvalidSchema'>
  // Rpc
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Expired'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist'>
  | NatError<'Client.SendSignedTransaction.Rpc.Timeout'>
  | NatError<'Client.SendSignedTransaction.Rpc.Internal'>
  // Stub
  | NatError<'Client.SendSignedTransaction.Unknown'>;

export type SafeSendSignedTransaction = (
  args: SendSignedTransactionArgs,
) => Promise<Result<SendSignedTransactionOutput, SendSignedTransactionError>>;

export type SendSignedTransaction = (
  args: SendSignedTransactionArgs,
) => Promise<SendSignedTransactionOutput>;

export type CreateSafeSendSignedTransaction = (
  clientContext: ClientContext,
) => SafeSendSignedTransaction;
