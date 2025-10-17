import { mergeTransportPolicy } from '../transportPolicy';
import type { TransportContext } from 'nat-types/client/transport';
import type { SendRequest } from 'nat-types/client/client';
import { runRounds } from './runRounds';

export const createSendRequest =
  (context: TransportContext): SendRequest =>
  async (args) => {
    const transportPolicy = mergeTransportPolicy(
      context.transportPolicy,
      args.transportPolicy,
    );

    // errorStack

    const result = await runRounds(
      context.rpcEndpoints,
      transportPolicy,
      args.method,
      args.params,
    );

    if (result.error) throw result.error;
    return result.value;
  };
