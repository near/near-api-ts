import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import {
  type GeneralRpcResponse,
  GeneralRpcResponseSchema,
} from '@common/schemas/zod/rpc';
import { fetchData, type FetchDataError } from './fetchData/fetchData';
import {
  parseJsonResponse,
  type ParseJsonResponseError,
} from './parseJsonResponse';
import type { InnerRpcEndpoint } from 'nat-types/client/transport/transport';
import type { Result } from 'nat-types/_common/common';
import { result } from '@common/utils/result';
import { log } from '../../../../../tests/integrations/utils/common';
import type { SendRequestContext } from 'nat-types/client/transport/sendRequest';
import { createNatError, type NatError } from '@common/natError';
import { extractRpcErrors, type HighLevelRpcErrors } from './extractRpcErrors';

type SendOnceError =
  | FetchDataError
  | ParseJsonResponseError
  | NatError<'Client.Transport.SendRequest.Response.InvalidSchema'>
  | HighLevelRpcErrors;

export type SendOnceResult = Result<GeneralRpcResponse, SendOnceError>;

export const sendOnce = async (
  context: SendRequestContext,
  rpc: InnerRpcEndpoint,
): Promise<SendOnceResult> => {
  const body = {
    jsonrpc: '2.0',
    id: 0,
    method: context.method,
    params: context.params,
  };

  // Try to send request to the rpc;
  const response = await fetchData(context, rpc, body);
  if (!response.ok) return response;

  // Try to parse response JSON to object;
  const json = await parseJsonResponse(response.value, rpc);
  if (!json.ok) return json;

  // We receive data from RPC in snake_case format - but we want to use camelCase in the lib;
  const camelCased = snakeToCamelCase(json.value);

  // Perform high level check if the RPC response matches the expected format;
  // We will do a precise check inside each client method (it's better for tree-shaking);
  const generalRpcResponse = GeneralRpcResponseSchema.safeParse(camelCased);
  log(generalRpcResponse); // TODO Delete

  if (!generalRpcResponse.success) {
    return result.err(
      createNatError({
        kind: 'Client.Transport.SendRequest.Response.InvalidSchema',
        context: { zodError: generalRpcResponse.error },
      }),
    );
  }

  // If an error happened during the request execution on the RPC side -
  // we want to extract some top level errors and see if we can try to resend the request
  // to the current or to the next RPC;
  return extractRpcErrors(generalRpcResponse.data, rpc);
};
