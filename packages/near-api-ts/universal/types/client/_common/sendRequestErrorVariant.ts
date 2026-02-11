import type {
  InnerRpcEndpoint,
  RpcTypePreferences,
  TransportContext,
} from '../transport/transport';
import type { JsonLikeValue, Milliseconds } from '../../_common/common';
import type { InvalidSchemaContext } from '../../natError';

// General union type for errors which may happen during a sending request to RPC
export type SendRequestErrorVariant<Prefix extends string> =
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
      context: InvalidSchemaContext;
    };
