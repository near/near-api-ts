import { result } from '../../../../_common/utils/result';
import type { InnerRpcEndpoint } from '../../../../../types/client/transport/transport';
import type { JsonLikeValue, Result } from '../../../../../types/_common/common';
import { createNatError, type NatError } from '../../../../_common/natError';

export type ParseJsonResponseError =
  NatError<'Client.Transport.SendRequest.Response.JsonParseFailed'>;

export const parseJsonResponse = async (
  response: Response,
  rpc: InnerRpcEndpoint,
): Promise<Result<JsonLikeValue, ParseJsonResponseError>> => {
  try {
    return result.ok(await response.json());
  } catch (e) {
    return result.err(
      createNatError({
        kind: 'Client.Transport.SendRequest.Response.JsonParseFailed',
        context: {
          cause: e,
          rpc,
          response,
        },
      }),
    );
  }
};
