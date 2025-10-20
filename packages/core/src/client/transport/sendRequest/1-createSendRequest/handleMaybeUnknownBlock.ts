import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import type {
  TransportContext,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { hasTransportErrorCode, TransportError } from '../../transportError';
import { tryMultipleRounds } from '../2-tryMultipleRounds/tryMultipleRounds';
import { mergeTransportPolicy } from '../../transportPolicy';
import { getAvailableRpcs } from './_common/getAvailableRpcs';

type Result =
  | { value: unknown; error?: never }
  | { value?: never; error: TransportError | RpcError };

type HandleMaybeUnknownBlock = (args: {
  result: Result;
  rpcEndpoints: TransportContext['rpcEndpoints'];
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  externalAbortSignal?: AbortSignal;
  requestTimeoutSignal: AbortSignal;
}) => Promise<Result>;

export const handleMaybeUnknownBlock: HandleMaybeUnknownBlock = async (
  args,
) => {
  // If it makes sense to execute the same request on archival RPCs;
  // Skip if the user has already tried running this request on an archival RPC
  if (
    !(
      hasRpcErrorCode(args.result.error, [
        'UnknownBlock',
        'GarbageCollectedBlock',
      ]) && (args.result.error as RpcError).request.rpcType === 'regular'
    )
  )
    return args.result;

  // If the user wants to use only regular RPC (and not use archival RPC)
  // and explicitly specified this in 'rpcTypePreferences', we return the previous error.
  if (!args.transportPolicy.rpcTypePreferences.includes('Archival'))
    return args.result;

  // If there are no available archival RPCs to try — return the previous error
  const rpcs = getAvailableRpcs(args.rpcEndpoints, ['Archival']);
  if (rpcs.error) return args.result;

  // Execute the request only on archival RPCs — one attempt will be
  // made for each RPC in the list
  const result = await tryMultipleRounds({
    rpcs: rpcs.value,
    transportPolicy: mergeTransportPolicy(args.transportPolicy, {
      rpcTypePreferences: ['Archival'],
    }),
    method: args.method,
    params: args.params,
    fallbackWhenUnknownBlock: true,
    externalAbortSignal: args.externalAbortSignal,
    requestTimeoutSignal: args.requestTimeoutSignal,
  });

  // // If there is no available archival rpcs to try on - return the previous error
  // if (hasTransportErrorCode(result.error, ['NoAvailableRpc']))
  //   return args.result;

  return result;
};
