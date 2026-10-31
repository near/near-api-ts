import * as z from 'zod/mini';
import type { InnerRpcEndpoint, RpcEndpoint } from '../../../types/client/transport/transport';

const RpcEndpointZodSchema = z.object({
  url: z.url(),
  headers: z.optional(z.record(z.string(), z.string())),
});

export const RpcEndpointsArgsZodSchema = z.union([
  z.object({
    regular: z.array(RpcEndpointZodSchema).check(z.minLength(1)),
    archival: z.optional(z.undefined()),
  }),
  z.object({
    regular: z.optional(z.undefined()),
    archival: z.array(RpcEndpointZodSchema).check(z.minLength(1)),
  }),
  z.object({
    regular: z.array(RpcEndpointZodSchema).check(z.minLength(1)),
    archival: z.array(RpcEndpointZodSchema).check(z.minLength(1)),
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
  }));
