import * as z from 'zod/mini';
import { DefaultTransportError } from '../defaultTransportError';
import { RpcError } from '../../rpcError';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { RpcResponseSchema } from '@common/schemas/zod/rpc';
import type { InnerRpcEndpoint } from 'nat-types/client/transport/defaultTransport';
import type { JsonLikeValue } from 'nat-types/common';
import { err, errAsync, ok, okAsync, ResultAsync } from 'neverthrow';

const fetchData = (rpc: InnerRpcEndpoint, body: any) => {
  return ResultAsync.fromPromise(
    fetch(rpc.url, {
      method: 'POST',
      headers: rpc.headers,
      body,
    }),
    (err) =>
      new DefaultTransportError({
        code: 'Fetch',
        message:
          `Fetch failed: unable to send the request to '${rpc.url}' ` +
          '(connection refused, DNS error or network issues).',
        cause: err,
      }),
  );

  // try {
  //   return ok(
  //     await fetch(rpc.url, {
  //       method: 'POST',
  //       headers: rpc.headers,
  //       body,
  //     }),
  //   );
  // } catch (e) {
  //   // TODO handle AbortError
  //   return err(
  //     new DefaultTransportError({
  //       code: 'Fetch',
  //       message:
  //         `Fetch failed: unable to send the request to '${rpc.url}' ` +
  //         '(connection refused, DNS error or network issues).',
  //       cause: e,
  //     }),
  //   );
  // }
};

const parseResponseToJson = async (
  response: Response,
  rpc: InnerRpcEndpoint,
): Promise<JsonLikeValue> => {
  try {
    return await response.json();
  } catch (e) {
    throw new DefaultTransportError({
      code: 'ParseJson',
      message: `Failed to parse response as JSON from the RPC node: ${rpc.url}`,
      cause: e,
    });
  }
};

export const fetchOnce = async (rpc: InnerRpcEndpoint, body: any) => {
  const response = await fetchData(rpc, body);
  if (response.isErr()) return response;

  const parsed = await parseResponseToJson(response.value, rpc);

  const camelCased = snakeToCamelCase(parsed);
  const validated = RpcResponseSchema.safeParse(camelCased);

  if (validated.error)
    throw new DefaultTransportError({
      code: 'InvalidResponseSchema',
      message:
        `Invalid RPC response format: \n` +
        `${z.prettifyError(validated.error)} \n\n` +
        `Response: ${JSON.stringify(camelCased, null, 2)} \n\n` +
        `Please try again or use another RPC node.`,
      cause: validated.error,
    });

  const { result, error } = validated.data;

  if (error)
    throw new RpcError({
      request: {
        url: rpc.url,
        method: 'POST',
        headers: rpc.headers,
        body: JSON.parse(body), // TODO create 'body' inside of this function
      },
      __rawRpcError: error,
    });

  return result;
};
