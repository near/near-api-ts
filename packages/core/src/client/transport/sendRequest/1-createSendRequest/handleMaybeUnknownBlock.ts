import type { TransportContext } from 'nat-types/client/transport/transport';
import { tryOneRound } from '../3-tryOneRound/tryOneRound';
import { mergeTransportPolicy } from '../../transportPolicy';
import { getAvailableRpcs } from './_common/getAvailableRpcs';
import type { SendRequestContext } from 'nat-types/client/transport/sendRequest';
import type { SendOnceResult } from '../5-sendOnce/sendOnce';
import { isNatErrorOf } from '@common/natError';

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
        'Client.Transport.SendRequest.Rpc.Block.GarbageCollected',
        'Client.Transport.SendRequest.Rpc.Block.NotFound',
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
