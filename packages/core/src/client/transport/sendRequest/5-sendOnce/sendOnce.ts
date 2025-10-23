import * as z from 'zod/mini';
import { TransportError } from '../../transportError';
import { RpcError } from '../../../rpcError';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { RpcResponseSchema } from '@common/schemas/zod/rpc';
import { fetchData } from './fetchData/fetchData';
import { parseJsonResponse } from './parseJsonResponse';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue, Result } from 'nat-types/common';

type SendOnce = (args: {
  rpc: InnerRpcEndpoint;
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
}) => Promise<Result<unknown, TransportError | RpcError>>;

export const sendOnce: SendOnce = async ({
  rpc,
  transportPolicy,
  method,
  params,
  externalAbortSignal,
  requestTimeoutSignal,
}) => {
  const body = {
    jsonrpc: '2.0',
    id: 0,
    method,
    params,
  };

  const response = await fetchData({
    rpc,
    transportPolicy,
    body,
    requestTimeoutSignal,
    externalAbortSignal,
  });
  if (response.error) return response;

  // Try to parse response in JSON
  const json = await parseJsonResponse(response.result, rpc);
  if (json.error) return json;

  const camelCased = snakeToCamelCase(json.value);
  const validated = RpcResponseSchema.safeParse(camelCased);

  // When the RPC response doesn't match the expected format
  if (validated.error)
    return {
      error: new TransportError({
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
          rpcType: rpc.type,
          method: 'POST',
          headers: rpc.headers,
          body,
        },
        __rawRpcError: error,
      }),
    };

  return { result };
};
