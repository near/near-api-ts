import { result } from '@common/utils/result';
import type { InnerRpcEndpoint } from 'nat-types/client/transport';
import { TransportError } from '../../transportError';
import type { JsonLikeValue, Result } from 'nat-types/common';

export const parseJsonResponse = async (
  response: Response,
  rpc: InnerRpcEndpoint,
): Promise<Result<JsonLikeValue, TransportError>> => {
  try {
    return result.ok(await response.json());
  } catch (e) {
    return result.err(
      new TransportError({
        code: 'ParseResponseToJson',
        message: `Failed to parse response as JSON from the RPC node: ${rpc.url}`,
        cause: e,
      }),
    )
  }
};
