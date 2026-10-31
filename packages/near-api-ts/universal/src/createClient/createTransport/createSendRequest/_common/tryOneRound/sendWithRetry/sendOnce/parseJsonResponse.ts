import type { JsonValue, Result } from '../../../../../../../../types/_common/common';
import type { InnerRpcEndpoint } from '../../../../../../../../types/client/transport/transport';
import type { NatError } from '../../../../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../../../../_common/_common/_common/result';

export type ParseJsonResponseError = NatError<'SendRequest.Attempt.Response.JsonParseFailed'>;

export const parseJsonResponse = async (
  response: Response,
  rpc: InnerRpcEndpoint,
): Promise<Result<JsonValue, ParseJsonResponseError>> => {
  try {
    return result.ok(await response.json());
  } catch (e) {
    return resultNatError('SendRequest.Attempt.Response.JsonParseFailed', {
      cause: e,
      rpc,
      response,
    });
  }
};
