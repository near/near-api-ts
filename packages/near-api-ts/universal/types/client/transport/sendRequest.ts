import type { NatError } from '../../../src/_common/natError';
import type { RpcResponse } from '../../../src/_common/schemas/zod/rpc';
import type { JsonLikeValue, Milliseconds, Result } from '../../_common/common';
import type { InvalidSchemaErrorContext } from '../../natError';
import type { InnerRpcEndpoint, PartialTransportPolicy, RpcTypePreferences, TransportContext, TransportPolicy } from './transport';

type RpcErrorContext = {
  rawRpcResponse: RpcResponse;
  rpc: InnerRpcEndpoint;
};

export type PreferredRpcNotFoundErrorContext = {
  rpcEndpoints: TransportContext['rpcEndpoints'];
  rpcTypePreferences: RpcTypePreferences;
};

export type TimeoutErrorContext = { timeoutMs: Milliseconds };
export type AbortedErrorContext = { reason: unknown };

export type ExhaustedErrors =
  | NatError<'SendRequest.Attempt.Request.FetchFailed'>
  | NatError<'SendRequest.Attempt.Request.Timeout'>
  | NatError<'SendRequest.Attempt.Response.JsonParseFailed'>
  | NatError<'SendRequest.Attempt.Response.InvalidSchema'>;

// TODO move to _common
export type ExhaustedErrorContext = {
  lastError: ExhaustedErrors;
  // TODO add policy? add errors list?
};

export interface SendRequestInnerErrorRegistry {
  'SendRequest.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'SendRequest.Timeout': TimeoutErrorContext;
  'SendRequest.Aborted': AbortedErrorContext;
  'SendRequest.Exhausted': ExhaustedErrorContext;
  // SendRequest.Exhausted cause options (SendRequest.Attempt.*)
  'SendRequest.Attempt.Request.FetchFailed': {
    cause: unknown;
    rpc: InnerRpcEndpoint;
    requestBody: JsonLikeValue;
  };
  'SendRequest.Attempt.Request.Timeout': { timeoutMs: Milliseconds };
  'SendRequest.Attempt.Response.JsonParseFailed': {
    cause: unknown;
    rpc: InnerRpcEndpoint;
    response: Response;
  };
  'SendRequest.Attempt.Response.InvalidSchema': InvalidSchemaErrorContext;
  // Inner RPC Errors - we use it only inside sendRequest
  'SendRequest.InnerRpc.MethodNotFound': RpcErrorContext;
  'SendRequest.InnerRpc.ParseFailed': RpcErrorContext;
  'SendRequest.InnerRpc.NotSynced': RpcErrorContext;
  'SendRequest.InnerRpc.Transaction.Timeout': RpcErrorContext;
  'SendRequest.InnerRpc.Block.GarbageCollected': RpcErrorContext;
  'SendRequest.InnerRpc.Block.NotFound': RpcErrorContext;
  'SendRequest.InnerRpc.Internal': RpcErrorContext;
}

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
  | NatError<'SendRequest.PreferredRpc.NotFound'>
  | NatError<'SendRequest.Timeout'>
  | NatError<'SendRequest.Aborted'>
  | NatError<'SendRequest.Exhausted'>;

export type SendRequest = (
  args: SendRequestArgs,
) => Promise<Result<RpcResponse, SendRequestError>>;
