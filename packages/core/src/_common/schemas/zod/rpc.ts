import * as z from 'zod/mini';
import { RpcErrorSchema } from '@near-js/jsonrpc-types';

export const RpcResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.unknown(),
  result: z.optional(z.unknown()),
  error: z.optional(RpcErrorSchema()),
});
