import * as z from 'zod/mini';

const BaseRpcResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.number(),
});

const BaseRpcErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.optional(z.unknown()),
});

const RpcErrorSchema = z.discriminatedUnion('name', [
  z.object({
    ...BaseRpcErrorSchema.shape,
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
    ...BaseRpcErrorSchema.shape,
    name: z.literal('HANDLER_ERROR'),
    cause: z.object({
      info: z.unknown(),
      name: z.string(),
    }),
  }),
  z.object({
    ...BaseRpcErrorSchema.shape,
    name: z.literal('INTERNAL_ERROR'),
    cause: z.object({
      name: z.literal('INTERNAL_ERROR'),
      info: z.object({ errorMessage: z.string() }),
    }),
  }),
]);

export type RpcError = z.infer<typeof RpcErrorSchema>;

export const RpcResponseSchema = z.union([
  z.object({
    ...BaseRpcResponseSchema.shape,
    result: z.unknown(),
    error: z.optional(z.never()),
  }),
  z.object({
    ...BaseRpcResponseSchema.shape,
    result: z.optional(z.never()),
    error: RpcErrorSchema,
  }),
]);

export type RpcResponse = z.infer<typeof RpcResponseSchema>;
