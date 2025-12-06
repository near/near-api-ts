import * as z from 'zod/mini';

const BaseResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.number(),
});

const BaseErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.optional(z.unknown()),
});

const GeneralRpcErrorSchema = z.discriminatedUnion('name', [
  z.object({
    ...BaseErrorSchema.shape,
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
    ...BaseErrorSchema.shape,
    name: z.literal('HANDLER_ERROR'),
    cause: z.object({
      info: z.unknown(),
      name: z.string(),
    }),
  }),
  z.object({
    ...BaseErrorSchema.shape,
    name: z.literal('INTERNAL_ERROR'),
    cause: z.object({
      name: z.literal('INTERNAL_ERROR'),
      info: z.object({ errorMessage: z.string() }),
    }),
  }),
]);

export type GeneralRpcError = z.infer<typeof GeneralRpcErrorSchema>;

export const GeneralRpcResponseSchema = z.union([
  z.object({
    ...BaseResponseSchema.shape,
    result: z.unknown(),
    error: z.optional(z.never()),
  }),
  z.object({
    ...BaseResponseSchema.shape,
    result: z.optional(z.never()),
    error: GeneralRpcErrorSchema,
  }),
]);

export type GeneralRpcResponse = z.infer<typeof GeneralRpcResponseSchema>;
