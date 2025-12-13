import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from 'nat-types/natError';
import type { SendRequestError } from 'nat-types/client/transport/sendRequest';
import type { RpcResponse } from '@common/schemas/zod/rpc';

export type CommonRpcMethodErrorVariant<Prefix extends string> =
  // Internal
  | {
      kind: `${Prefix}.Rpc.Unclassified`;
      context: { rpcResponse: RpcResponse };
    }
  // Public
  | {
      kind: `${Prefix}.Args.InvalidSchema`;
      context: InvalidSchemaContext;
    }
  | {
      kind: `${Prefix}.SendRequest.Failed`;
      context: { cause: SendRequestError };
    }
  | {
      kind: `${Prefix}.Internal`;
      context: InternalErrorContext;
    };
