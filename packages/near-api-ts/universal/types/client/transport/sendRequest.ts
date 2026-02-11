import type {
  JsonLikeValue,
  Milliseconds,
  Result,
} from '../../_common/common';
import type {
  InnerRpcEndpoint,
  PartialTransportPolicy,
  RpcTypePreferences,
  TransportContext,
  TransportPolicy,
} from './transport';
import type { NatError } from '../../../src/_common/natError';
import type { RpcResponse } from '../../../src/_common/schemas/zod/rpc';
import type { InvalidSchemaContext } from '../../natError';

type RpcErrorContext = {
  rawRpcResponse: RpcResponse;
  rpc: InnerRpcEndpoint;
};

export type SendRequestErrorVariant =
  | {
      kind: `Client.Transport.SendRequest.PreferredRpc.NotFound`;
      context: {
        rpcEndpoints: TransportContext['rpcEndpoints'];
        rpcTypePreferences: RpcTypePreferences;
      };
    }
  | {
      kind: `Client.Transport.SendRequest.Request.FetchFailed`;
      context: {
        cause: unknown;
        rpc: InnerRpcEndpoint;
        requestBody: JsonLikeValue;
      };
    }
  | {
      kind: `Client.Transport.SendRequest.Request.Attempt.Timeout`;
      context: { allowedMs: Milliseconds };
    }
  | {
      kind: `Client.Transport.SendRequest.Request.Timeout`;
      context: { allowedMs: Milliseconds };
    }
  | {
      kind: `Client.Transport.SendRequest.Request.Aborted`;
      context: { reason: unknown };
    }
  | {
      kind: `Client.Transport.SendRequest.Response.JsonParseFailed`;
      context: {
        cause: unknown;
        rpc: InnerRpcEndpoint;
        response: Response;
      };
    }
  | {
      kind: `Client.Transport.SendRequest.Response.InvalidSchema`;
      context: InvalidSchemaContext;
    }
  | {
      kind: `Client.Transport.SendRequest.Response.Result.InvalidSchema`;
      context: InvalidSchemaContext;
    }
  | {
      kind: `Client.Transport.SendRequest.Response.Error.InvalidSchema`;
      context: InvalidSchemaContext;
    };

// Transport Inner RPC Related Errors // TODO rename to Inner
export type HighLevelRpcErrorVariant =
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

// TODO Rename and remove
export type SendRequestError =
  | NatError<'Client.Transport.SendRequest.PreferredRpc.NotFound'>
  | NatError<'Client.Transport.SendRequest.Request.FetchFailed'>
  | NatError<'Client.Transport.SendRequest.Request.Attempt.Timeout'>
  | NatError<'Client.Transport.SendRequest.Request.Timeout'>
  | NatError<'Client.Transport.SendRequest.Request.Aborted'>
  | NatError<'Client.Transport.SendRequest.Response.JsonParseFailed'>
  | NatError<'Client.Transport.SendRequest.Response.InvalidSchema'>
  | NatError<'Client.Transport.SendRequest.Response.Result.InvalidSchema'>
  | NatError<'Client.Transport.SendRequest.Response.Error.InvalidSchema'>;

export type SendRequest = (
  args: SendRequestArgs,
) => Promise<Result<RpcResponse, SendRequestError>>;
