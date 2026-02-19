import type { SendRequestContext } from '@universal/types/client/transport/sendRequest';
import type { TransportContext } from '@universal/types/client/transport/transport';
import { isNatErrorOf } from '../../../../_common/natError';
import { mergeTransportPolicy } from '../../transportPolicy';
import { tryOneRound } from '../3-tryOneRound/tryOneRound';
import type { SendOnceResult } from '../5-sendOnce/sendOnce';
import { getAvailableRpcs } from './_common/getAvailableRpcs';

type HandleMaybeUnknownBlock = (args: {
  requestResult: SendOnceResult;
  rpcEndpoints: TransportContext['rpcEndpoints'];
  context: SendRequestContext;
}) => Promise<SendOnceResult>;

export const handleMaybeUnknownBlock: HandleMaybeUnknownBlock = async ({
  requestResult: previousResult,
  rpcEndpoints,
  context,
}) => {
  // Decide if it makes sense to execute the same request on archival RPCs;
  // Skip it if:
  // - Is not an UnknownBlock/GarbageCollectedBlock error;
  // - The user has already tried running this request on an archival RPC OR;
  // - The user wants to use only regular RPC (and do not use archival RPC)
  if (
    previousResult.ok ||
    !(
      isNatErrorOf(previousResult.error, [
        'SendRequest.InnerRpc.Block.GarbageCollected',
        'SendRequest.InnerRpc.Block.NotFound',
      ]) &&
      previousResult.error.context.rpc.type === 'regular' &&
      context.transportPolicy.rpcTypePreferences.includes('Archival')
    )
  )
    return previousResult;

  // If there are no available archival RPCs to try — return the previous error
  const rpcs = getAvailableRpcs(rpcEndpoints, ['Archival']);
  if (!rpcs.ok) return previousResult;

  // Execute the request only on archival RPCs — one attempt will be
  // made for each RPC in the list
  return await tryOneRound(
    {
      ...context,
      transportPolicy: mergeTransportPolicy(context.transportPolicy, {
        rpcTypePreferences: ['Archival'],
      }),
    },
    rpcs.value,
  );
};
