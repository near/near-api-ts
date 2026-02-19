import type { JsonLikeValue, Result } from '@universal/types/_common/common';
import type { InnerRpcEndpoint } from '@universal/types/client/transport/transport';
import { createNatError, type NatError } from '../../../../_common/natError';
import { result } from '../../../../_common/utils/result';

export type ParseJsonResponseError =
  NatError<'SendRequest.Attempt.Response.JsonParseFailed'>;

export const parseJsonResponse = async (
  response: Response,
  rpc: InnerRpcEndpoint,
): Promise<Result<JsonLikeValue, ParseJsonResponseError>> => {
  try {
    return result.ok(await response.json());
  } catch (e) {
    return result.err(
      createNatError({
        kind: 'SendRequest.Attempt.Response.JsonParseFailed',
        context: {
          cause: e,
          rpc,
          response,
        },
      }),
    );
  }
};
