import * as z from 'zod/mini';
import { RpcErrorSchema } from '@near-js/jsonrpc-types';

const BaseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.unknown(),
});

export const RpcResponseSchema = z.union([
  z.object({ ...BaseSchema.shape, result: z.unknown() }),
  z.object({ ...BaseSchema.shape, error: RpcErrorSchema() }),
]);
