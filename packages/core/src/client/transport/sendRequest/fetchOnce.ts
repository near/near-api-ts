import * as z from 'zod/mini';
import { DefaultTransportError } from '../defaultTransportError';
import { RpcError } from '../../rpcError';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { RpcResponseSchema } from '@common/schemas/zod/rpc';
import type { InnerRpcEndpoint } from 'nat-types/client/transport/defaultTransport';
import type { JsonLikeValue } from 'nat-types/common';

const fetchData = async (rpc: InnerRpcEndpoint, body: JsonLikeValue) => {
  try {
    const value = await fetch(rpc.url, {
      method: 'POST',
      headers: rpc.headers,
      body: JSON.stringify(body),
    });

    return { value };
  } catch (e) {
    return {
      error: new DefaultTransportError({
        code: 'Fetch',
        message:
          `Fetch failed: unable to send the request to '${rpc.url}' ` +
          '(connection refused, DNS error or network issues).',
        cause: e,
      }),
    };
  }
};

const parseJsonResponse = async (response: Response, rpc: InnerRpcEndpoint) => {
  try {
    return { value: await response.json() };
  } catch (e) {
    return {
      error: new DefaultTransportError({
        code: 'ParseJson',
        message: `Failed to parse response as JSON from the RPC node: ${rpc.url}`,
        cause: e,
      }),
    };
  }
};

export const fetchOnce = async (
  rpc: InnerRpcEndpoint,
  method: string,
  params: JsonLikeValue,
): Promise<
  | { value: unknown; error?: never }
  | { value?: never; error: DefaultTransportError | RpcError }
> => {
  const body = {
    jsonrpc: '2.0',
    id: 0,
    method,
    params,
  };

  const response = await fetchData(rpc, body);
  if (response.error) return response;

  // TODO Handle 429 status

  const json = await parseJsonResponse(response.value, rpc);
  if (json.error) return json;

  const camelCased = snakeToCamelCase(json.value);
  const validated = RpcResponseSchema.safeParse(camelCased);

  // When the RPC response doesn't match the expected format
  if (validated.error)
    return {
      error: new DefaultTransportError({
        code: 'InvalidResponseSchema',
        message:
          `Invalid RPC response format: \n` +
          `${z.prettifyError(validated.error)} \n\n` +
          `Response: ${JSON.stringify(camelCased, null, 2)} \n\n` +
          `Please try again or use another RPC node.`,
        cause: validated.error,
      }),
    };

  const { result, error } = validated.data;

  if (error)
    return {
      error: new RpcError({
        request: {
          url: rpc.url,
          method: 'POST',
          headers: rpc.headers,
          body,
        },
        __rawRpcError: error,
      }),
    };

  return { value: result };
};
