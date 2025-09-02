import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import {
  RpcProtocolConfigResponseSchema,
  RuntimeConfigViewSchema,
  VMConfigViewSchema,
} from '@near-js/jsonrpc-types';
import type { CreateGetProtocolConfig } from 'nat-types/client/protocol/getProtocolConfig';

// TODO Use jsonrpc-types RpcProtocolConfigResponseSchema after 2.8.0
const TemporaryProtocolConfigShema = z.object({
  ...RpcProtocolConfigResponseSchema().shape,
  runtimeConfig: z.object({
    ...RuntimeConfigViewSchema().shape,
    wasmConfig: z.omit(VMConfigViewSchema(), { reftypesBulkMemory: true }),
  }),
});

export type TemporaryProtocolConfig = z.infer<
  typeof TemporaryProtocolConfigShema
>;

const transformResult = (result: unknown): TemporaryProtocolConfig => {
  const camelCased = snakeToCamelCase(result);
  return TemporaryProtocolConfigShema.parse(camelCased);
};

export const createGetProtocolConfig: CreateGetProtocolConfig =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      body: {
        method: 'EXPERIMENTAL_protocol_config',
        params: toNativeBlockReference(args?.blockReference),
      },
    });
    return transformResult(result);
  };
