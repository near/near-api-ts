import * as z from 'zod/mini';
import type { InnerRpcEndpoint, RpcEndpoint } from 'nat-types/client/transport/transport';

const RpcEndpointSchema = z.object({
  url: z.url(),
  headers: z.optional(z.record(z.string(), z.string())),
});

export const RpcEndpointsArgsSchema = z.union([
  z.object({
    regular: z.array(RpcEndpointSchema).check(z.minLength(1)),
    archival: z.undefined(),
  }),
  z.object({
    regular: z.undefined(),
    archival: z.array(RpcEndpointSchema).check(z.minLength(1)),
  }),
  z.object({
    regular: z.array(RpcEndpointSchema).check(z.minLength(1)),
    archival: z.array(RpcEndpointSchema).check(z.minLength(1)),
  }),
]);

export const getInnerRpcEndpoints = (
  list: RpcEndpoint[] = [],
  type: 'regular' | 'archival',
): InnerRpcEndpoint[] =>
  list.map((rpc) => ({
    type,
    url: rpc.url,
    headers: {
      ...rpc.headers,
      'Content-Type': 'application/json',
    },
    inactiveUntil: null,
  }));
