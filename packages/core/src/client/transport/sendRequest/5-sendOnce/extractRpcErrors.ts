import type { Result } from 'nat-types/_common/common';
import type {
  GeneralRpcError,
  GeneralRpcResponse,
} from '@common/schemas/zod/rpc';
import { createNatError, type NatError } from '@common/natError';
import { result } from '@common/utils/result';
import type {InnerRpcEndpoint} from 'nat-types/client/transport/transport';

export type HighLevelRpcErrors =
  | NatError<'Client.Transport.SendRequest.Rpc.MethodNotFound'>
  | NatError<'Client.Transport.SendRequest.Rpc.ParseFailed'>
  | NatError<'Client.Transport.SendRequest.Rpc.NotSynced'>
  | NatError<'Client.Transport.SendRequest.Rpc.Transaction.Timeout'>
  | NatError<'Client.Transport.SendRequest.Rpc.Block.GarbageCollected'>
  | NatError<'Client.Transport.SendRequest.Rpc.Block.NotFound'>
  | NatError<'Client.Transport.SendRequest.Rpc.Internal'>;

const prefix = 'Client.Transport.SendRequest.Rpc';

const getErrorKind = ({
  name,
  cause,
}: GeneralRpcError): HighLevelRpcErrors['kind'] | undefined => {
  // Request Validation Errors
  if (name === 'REQUEST_VALIDATION_ERROR') {
    if (cause.name === 'METHOD_NOT_FOUND') return `${prefix}.MethodNotFound`;
    if (cause.name === 'PARSE_ERROR') return `${prefix}.ParseFailed`;
  }

  // UnavailableShard

  // Handler Errors
  if (name === 'HANDLER_ERROR') {
    // biome-ignore format: keep compact
    if (cause.name === 'NO_SYNCED_BLOCKS') return `${prefix}.NotSynced`; // 'query'
    // if (cause.name === 'UNAVAILABLE_SHARD') return `${prefix}.Shard.NotFound`; // 'query'
    // if (cause.name === 'DOES_NOT_TRACK_SHARD') return `${prefix}.Shard.NotFound`; // 'send_tx' / 'tx'
    if (cause.name === 'TIMEOUT_ERROR') return `${prefix}.Transaction.Timeout`; // 'send_tx' / 'tx'
    if (cause.name === 'GARBAGE_COLLECTED_BLOCK') return `${prefix}.Block.GarbageCollected`; // 'query'
    if (cause.name === 'UNKNOWN_BLOCK') return `${prefix}.Block.NotFound`; // 'query' / 'block'
    if (cause.name === 'INTERNAL_ERROR') return `${prefix}.Internal`; // all
  }

  // Internal
  if (name === 'INTERNAL_ERROR') return `${prefix}.Internal`;
};

export const extractRpcErrors = (
  generalRpcResponse: GeneralRpcResponse,
  rpc: InnerRpcEndpoint,
): Result<GeneralRpcResponse, HighLevelRpcErrors> => {
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
