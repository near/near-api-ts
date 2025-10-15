import { mergeRequestPolicy } from '../requestPolicy';
import type { DefaultTransportContext } from 'nat-types/client/transport/defaultTransport';
import type { SendRequest } from 'nat-types/client/client';
import { runRounds } from './runRounds';

export const createSendRequest =
  (context: DefaultTransportContext): SendRequest =>
  async ({ body }) => {
    const { method, params } = body as any;
    // TODO: pass requestPolicy from the client method(f.e: from getTransaction)
    const requestPolicy = mergeRequestPolicy(context.requestPolicy);

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
