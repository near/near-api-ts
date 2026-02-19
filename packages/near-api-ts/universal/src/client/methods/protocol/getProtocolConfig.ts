import { RpcProtocolConfigResponseSchema, RuntimeConfigViewSchema, VMConfigViewSchema } from '@near-js/jsonrpc-types';
import type { CreateGetProtocolConfig } from '@universal/types/client/methods/protocol/getProtocolConfig';
import * as z from 'zod/mini';
import { toNativeBlockReference } from '../../../_common/transformers/toNative/blockReference';

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
      transportPolicy: args?.policies?.transport,
      signal: args?.options?.signal,
    });

    return transformResult(result);
  };
