import * as z from 'zod/mini';
import type { Prettify } from '../../../../../types/utils';

const RpcErrorCommonFieldsZodSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.optional(z.unknown()),
});

export const RequestValidationErrorZodSchema = z.object({
  ...RpcErrorCommonFieldsZodSchema.shape,
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
});

export const InternalErrorZodSchema = z.object({
  ...RpcErrorCommonFieldsZodSchema.shape,
  name: z.literal('INTERNAL_ERROR'),
  cause: z.object({
    name: z.literal('INTERNAL_ERROR'),
    info: z.object({ errorMessage: z.string() }),
  }),
});

export const createHandlerErrorZodSchema = <
  Cause extends z.core.$ZodType,
  Data extends z.core.$ZodType,
>(args: {
  cause: Cause;
  data: Data;
}) =>
  z.object({
    name: z.literal('HANDLER_ERROR'),
    cause: args.cause,
    code: z.number(),
    message: z.string(),
    data: args.data,
  });

const BaseHandlerErrorZodSchema = createHandlerErrorZodSchema({
  cause: z.object({
    info: z.unknown(),
    name: z.string(),
  }),
  data: z.optional(z.unknown()),
});

const BaseRpcErrorZodSchema = z.discriminatedUnion('name', [
  RequestValidationErrorZodSchema,
  BaseHandlerErrorZodSchema,
  InternalErrorZodSchema,
]);

export type BaseRpcError = Prettify<z.infer<typeof BaseRpcErrorZodSchema>>;

export const BaseRpcResponseZodSchema = z.union([
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
    error: BaseRpcErrorZodSchema,
  }),
]);

export type BaseRpcResponse = Prettify<z.infer<typeof BaseRpcResponseZodSchema>>;
