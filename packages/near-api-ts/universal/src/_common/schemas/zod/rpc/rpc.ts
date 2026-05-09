import * as z from 'zod/mini';
import type { Prettify } from '../../../../../types/utils';

const BaseRpcErrorZodSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.optional(z.unknown()),
});

const RpcErrorZodSchema = z.discriminatedUnion('name', [
  z.object({
    ...BaseRpcErrorZodSchema.shape,
    name: z.literal('REQUEST_VALIDATION_ERROR'),
    cause: z.discriminatedUnion('name', [
      z.object({
        name: z.literal('METHOD_NOT_FOUND'),
        info: z.object({ methodName: z.string() }),
      }),
      z.object({
        name: z.literal('PARSE_ERROR'),
        info: z.object({ errorMessage: z.string() }),
      }),
    ]),
  }),
  z.object({
    ...BaseRpcErrorZodSchema.shape,
    name: z.literal('HANDLER_ERROR'),
    cause: z.object({
      info: z.unknown(),
      name: z.string(),
    }),
  }),
  z.object({
    ...BaseRpcErrorZodSchema.shape,
    name: z.literal('INTERNAL_ERROR'),
    cause: z.object({
      name: z.literal('INTERNAL_ERROR'),
      info: z.object({ errorMessage: z.string() }),
    }),
  }),
]);

export type RpcError = Prettify<z.infer<typeof RpcErrorZodSchema>>;

export const RpcResponseZodSchema = z.union([
  z.object({
    jsonrpc: z.literal('2.0'),
    id: z.number(),
    result: z.unknown(),
    error: z.optional(z.never()),
  }),
  z.object({
    jsonrpc: z.literal('2.0'),
    id: z.number(),
    result: z.optional(z.never()),
    error: RpcErrorZodSchema,
  }),
]);

export type RpcResponse = Prettify<z.infer<typeof RpcResponseZodSchema>>;
