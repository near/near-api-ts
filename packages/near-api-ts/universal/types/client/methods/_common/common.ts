import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from '../../../natError';
import type { SendRequestError } from '../../transport/sendRequest';
import type { RpcResponse } from '../../../../src/_common/schemas/zod/rpc';

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
      kind: `${Prefix}.SendRequest.Failed`; // TODO remove after refactor
      context: { cause: SendRequestError };
    }
  | {
      kind: `${Prefix}.Internal`;
      context: InternalErrorContext;
    };
