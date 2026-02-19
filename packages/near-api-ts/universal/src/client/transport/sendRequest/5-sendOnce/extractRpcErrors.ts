import type { Result } from '../../../../../types/_common/common';
import type {
  RpcError,
  RpcResponse,
} from '../../../../_common/schemas/zod/rpc';
import { createNatError, type NatError } from '../../../../_common/natError';
import { result } from '../../../../_common/utils/result';
import type { InnerRpcEndpoint } from '../../../../../types/client/transport/transport';

export type HighLevelRpcErrors =
  | NatError<'SendRequest.InnerRpc.MethodNotFound'>
  | NatError<'SendRequest.InnerRpc.ParseFailed'>
  | NatError<'SendRequest.InnerRpc.NotSynced'>
  | NatError<'SendRequest.InnerRpc.Transaction.Timeout'>
  | NatError<'SendRequest.InnerRpc.Block.GarbageCollected'>
  | NatError<'SendRequest.InnerRpc.Block.NotFound'>
  | NatError<'SendRequest.InnerRpc.Internal'>;

const prefix = 'SendRequest.InnerRpc';

const getErrorKind = ({
  name,
  cause,
}: RpcError): HighLevelRpcErrors['kind'] | undefined => {
  // Request Validation Errors
  if (name === 'REQUEST_VALIDATION_ERROR') {
    if (cause.name === 'METHOD_NOT_FOUND') return `${prefix}.MethodNotFound`;
    if (cause.name === 'PARSE_ERROR') return `${prefix}.ParseFailed`;
  }

  // UnavailableShard

  // Handler Errors
  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'NO_SYNCED_BLOCKS') return `${prefix}.NotSynced`; // 'query'
    if (cause.name === 'NOT_SYNCED_YET') return `${prefix}.NotSynced`; // 'block'
    if (cause.name === 'TIMEOUT_ERROR') return `${prefix}.Transaction.Timeout`; // 'send_tx' / 'tx'
    if (cause.name === 'GARBAGE_COLLECTED_BLOCK') return `${prefix}.Block.GarbageCollected`; // 'query'
    if (cause.name === 'UNKNOWN_BLOCK') return `${prefix}.Block.NotFound`; // 'query' / 'block'
    if (cause.name === 'INTERNAL_ERROR') return `${prefix}.Internal`; // all
  }

  // Internal
  if (name === 'INTERNAL_ERROR') return `${prefix}.Internal`;
};

export const extractRpcErrors = (
  generalRpcResponse: RpcResponse,
  rpc: InnerRpcEndpoint,
): Result<RpcResponse, HighLevelRpcErrors> => {
  if ('result' in generalRpcResponse) return result.ok(generalRpcResponse);

  const kind = getErrorKind(generalRpcResponse.error);
  if (!kind) return result.ok(generalRpcResponse);

  return result.err(
    createNatError({
      kind,
      context: {
        rawRpcResponse: generalRpcResponse,
        rpc,
      },
    }),
  );
};
