import type {
  JsonLikeValue,
  Milliseconds,
  Result,
} from 'nat-types/_common/common';
import type {
  InnerRpcEndpoint,
  PartialTransportPolicy,
  RpcTypePreferences,
  TransportContext,
  TransportPolicy,
} from 'nat-types/client/transport/transport';
import type { NatError } from '@common/natError';
import type { $ZodError } from 'zod/v4/core';
import type { RpcResponse } from '@common/schemas/zod/rpc';

type RpcErrorContext = {
  rawRpcResponse: RpcResponse;
  rpc: InnerRpcEndpoint;
};

export type SendRequestErrorVariant<
  Prefix extends string = 'Client.Transport.SendRequest',
> =
  | {
      kind: `${Prefix}.PreferredRpc.NotFound`;
      context: {
        rpcEndpoints: TransportContext['rpcEndpoints'];
        rpcTypePreferences: RpcTypePreferences;
      };
    }
  | {
      kind: `${Prefix}.Request.FetchFailed`;
      context: {
        cause: unknown;
        rpc: InnerRpcEndpoint;
        requestBody: JsonLikeValue;
      };
    }
  | {
      kind: `${Prefix}.Request.Attempt.Timeout`;
      context: { allowedMs: Milliseconds };
    }
  | {
      kind: `${Prefix}.Request.Timeout`;
      context: { allowedMs: Milliseconds };
    }
  | {
      kind: `${Prefix}.Request.Aborted`;
      context: { reason: unknown };
    }
  | {
      kind: `${Prefix}.Response.JsonParseFailed`;
      context: {
        cause: unknown;
        rpc: InnerRpcEndpoint;
        response: Response;
      };
    }
  | {
      kind: `${Prefix}.Response.InvalidSchema`;
      context: { zodError: $ZodError };
    };

export type HighLevelRpcErrorVariant =
  // RPC Related Errors
  | {
      kind: 'Client.Transport.SendRequest.Rpc.MethodNotFound';
      context: RpcErrorContext;
    }
  | {
      kind: 'Client.Transport.SendRequest.Rpc.ParseFailed';
      context: RpcErrorContext;
    }
  | {
      kind: 'Client.Transport.SendRequest.Rpc.NotSynced';
      context: RpcErrorContext;
    }
  | {
      kind: 'Client.Transport.SendRequest.Rpc.Transaction.Timeout';
      context: RpcErrorContext;
    }
  | {
      kind: 'Client.Transport.SendRequest.Rpc.Block.GarbageCollected';
      context: RpcErrorContext;
    }
  | {
      kind: 'Client.Transport.SendRequest.Rpc.Block.NotFound';
      context: RpcErrorContext;
    }
  | {
      kind: 'Client.Transport.SendRequest.Rpc.Internal';
      context: RpcErrorContext;
    };

export type SendRequestContext = {
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
};

type SendRequestArgs = {
  method: string;
  params: JsonLikeValue;
  transportPolicy?: PartialTransportPolicy;
  signal?: AbortSignal;
};

export type SendRequestError =
  | NatError<'Client.Transport.SendRequest.PreferredRpc.NotFound'>
  | NatError<'Client.Transport.SendRequest.Request.FetchFailed'>
  | NatError<'Client.Transport.SendRequest.Request.Attempt.Timeout'>
  | NatError<'Client.Transport.SendRequest.Request.Timeout'>
  | NatError<'Client.Transport.SendRequest.Request.Aborted'>
  | NatError<'Client.Transport.SendRequest.Response.JsonParseFailed'>
  | NatError<'Client.Transport.SendRequest.Response.InvalidSchema'>;

export type SendRequest = (
  args: SendRequestArgs,
) => Promise<Result<RpcResponse, SendRequestError>>;
