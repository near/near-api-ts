import { mergeTransportPolicy } from '../transportPolicy';
import type { TransportContext } from 'nat-types/client/transport';
import type { SendRequest } from 'nat-types/client/client';
import { runRounds } from './runRounds';

export const createSendRequest =
  (context: TransportContext): SendRequest =>
  async ({ method, params }) => {
    // TODO: pass requestPolicy from the client method(f.e: from getTransaction)
    const requestPolicy = mergeTransportPolicy(context.transportPolicy);

    // errorStack

    const result = await runRounds(
      context.rpcEndpoints,
      requestPolicy,
      method,
      params,
    );

    if (result.error) throw result.error;
    return result.value;
  };
