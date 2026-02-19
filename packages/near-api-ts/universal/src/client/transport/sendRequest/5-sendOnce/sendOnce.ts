import { snakeToCamelCase } from '../../../../_common/utils/snakeToCamelCase';
import {
  type RpcResponse,
  RpcResponseSchema,
} from '../../../../_common/schemas/zod/rpc';
import { fetchData } from './fetchData/fetchData';
import { parseJsonResponse } from './parseJsonResponse';
import type { InnerRpcEndpoint } from '../../../../../types/client/transport/transport';
import type { Result } from '../../../../../types/_common/common';
import { result } from '../../../../_common/utils/result';
import type { SendRequestContext } from '../../../../../types/client/transport/sendRequest';
import { createNatError, type NatError } from '../../../../_common/natError';
import { extractRpcErrors } from './extractRpcErrors';

type SendOnceError =
  | NatError<'SendRequest.Timeout'>
  | NatError<'SendRequest.Aborted'>
  | NatError<'SendRequest.Attempt.Request.FetchFailed'>
  | NatError<'SendRequest.Attempt.Request.Timeout'>
  | NatError<'SendRequest.Attempt.Response.JsonParseFailed'>
  | NatError<'SendRequest.Attempt.Response.InvalidSchema'>
  | NatError<'SendRequest.InnerRpc.MethodNotFound'>
  | NatError<'SendRequest.InnerRpc.ParseFailed'>
  | NatError<'SendRequest.InnerRpc.NotSynced'>
  | NatError<'SendRequest.InnerRpc.Transaction.Timeout'>
  | NatError<'SendRequest.InnerRpc.Block.GarbageCollected'>
  | NatError<'SendRequest.InnerRpc.Block.NotFound'>
  | NatError<'SendRequest.InnerRpc.Internal'>;

export type SendOnceResult = Result<RpcResponse, SendOnceError>;

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

  // Try to send a request to the rpc;
  const response = await fetchData(context, rpc, body);
  if (!response.ok) return response;

  // Try to parse response JSON to an object;
  const json = await parseJsonResponse(response.value, rpc);
  if (!json.ok) return json;

  // We receive data from RPC in snake_case format - but we want to use camelCase in the lib;
  const camelCased = snakeToCamelCase(json.value);

  // Perform high level check if the RPC response matches the expected format;
  // We will do a precise check inside each client method (it's better for tree-shaking);
  const generalRpcResponse = RpcResponseSchema.safeParse(camelCased);

  if (!generalRpcResponse.success) {
    return result.err(
      createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: generalRpcResponse.error },
      }),
    );
  }

  // If an error happened during the request execution on the RPC side -
  // we want to extract some top level errors and see if we can try to resend the request
  // to the current or to the next RPC;
  return extractRpcErrors(generalRpcResponse.data, rpc);
};
