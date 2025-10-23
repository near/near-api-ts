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
import type { Result } from 'nat-types/common';

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
  if (response.error) {
    response.error.request = request; // TODO move inside
    context.errors.push(response.error);
    return response;
  }

  // Try to parse response in JSON
  const json = await parseJsonResponse(response.result, rpc);
  if (json.error) {
    json.error.request = request; // TODO move inside
    context.errors.push(json.error);
    return json;
  }

  const camelCased = snakeToCamelCase(json.result);
  const validated = RpcResponseSchema.safeParse(camelCased);

  // When the RPC response doesn't match the expected format
  if (validated.error) {
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
    return { error: validationError };
  }

  const { result, error } = validated.data;

  // If error happened during execution request on the RPC side
  if (error) {
    const rpcError = new RpcError({
      request,
      __rawRpcError: error,
    });
    context.errors.push(rpcError);
    return { error: rpcError };
  }

  return { result };
};
