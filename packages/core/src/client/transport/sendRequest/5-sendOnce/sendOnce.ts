import * as z from 'zod/mini';
import { TransportError } from '../../transportError';
import { RpcError } from '../../../rpcError';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { RpcResponseSchema } from '@common/schemas/zod/rpc';
import { fetchData } from './fetchData/fetchData';
import { parseJsonResponse } from './parseJsonResponse';
import type {
  InnerRpcEndpoint,
  SendRequestContext,
} from 'nat-types/client/transport';
import type { Result } from 'nat-types/_common/common';
import { result } from '@common/utils/result';

export const sendOnce = async (
  context: SendRequestContext,
  rpc: InnerRpcEndpoint,
  roundIndex: number,
  attemptIndex: number,
): Promise<Result<unknown, TransportError | RpcError>> => {
  const body = {
    jsonrpc: '2.0',
    id: 0,
    method: context.method,
    params: context.params,
  };

  // For better error logging
  const request = {
    url: rpc.url,
    rpcType: rpc.type,
    method: 'POST',
    headers: rpc.headers,
    body,
    roundIndex,
    attemptIndex,
  };

  // Try to send request to the rpc
  const response = await fetchData(context, rpc, body);
  if (!response.ok) {
    response.error.request = request; // TODO move inside
    context.errors.push(response.error);
    return response;
  }

  // Try to parse response in JSON
  const json = await parseJsonResponse(response.value, rpc);
  if (!json.ok) {
    json.error.request = request; // TODO move inside
    context.errors.push(json.error);
    return json;
  }

  const camelCased = snakeToCamelCase(json.value);
  const validated = RpcResponseSchema.safeParse(camelCased);

  // When the RPC response doesn't match the expected format
  if (!validated.success) {
    const validationError = new TransportError({
      code: 'InvalidResponseSchema',
      message:
        `Invalid RPC response format: \n` +
        `${z.prettifyError(validated.error)} \n\n` +
        `Response: ${JSON.stringify(camelCased, null, 2)} \n\n` +
        `Please try again or use another RPC node.`,
      request,
      cause: validated.error,
    });
    context.errors.push(validationError);
    return result.err(validationError);
  }

  // If error happened during request execution on the RPC side
  if ('error' in validated.data) {
    const rpcError = new RpcError({
      request,
      __rawRpcError: validated.data.error,
    });
    context.errors.push(rpcError);
    return result.err(rpcError);
  }

  return result.ok(validated.data.result);
};
