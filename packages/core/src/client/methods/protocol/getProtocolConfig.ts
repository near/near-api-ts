import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import {
  RpcProtocolConfigResponseSchema,
  RuntimeConfigViewSchema,
  VMConfigViewSchema,
} from '@near-js/jsonrpc-types';
import type { CreateGetProtocolConfig } from 'nat-types/client/methods/protocol/getProtocolConfig';

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
  return TemporaryProtocolConfigShema.parse(result);
};

export const createGetProtocolConfig: CreateGetProtocolConfig =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      method: 'EXPERIMENTAL_protocol_config',
      params: toNativeBlockReference(args?.atMomentOf),
    });
    return transformResult(result);
  };
