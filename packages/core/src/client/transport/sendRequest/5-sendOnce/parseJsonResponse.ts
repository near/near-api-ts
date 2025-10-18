import type { InnerRpcEndpoint } from 'nat-types/client/transport';
import { TransportError } from '../../transportError';

export const parseJsonResponse = async (
  response: Response,
  rpc: InnerRpcEndpoint,
) => {
  try {
    return { value: await response.json() };
  } catch (e) {
    return {
      error: new TransportError({
        code: 'ParseResponseJson',
        message: `Failed to parse response as JSON from the RPC node: ${rpc.url}`,
        cause: e,
      }),
    };
  }
};
