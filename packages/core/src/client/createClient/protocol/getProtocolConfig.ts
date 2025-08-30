import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type { CreateGetProtocolConfig } from 'nat-types/client/protocol/getProtocolConfig';

// TODO the method is unstable and there is no types we can provide - fix in the future
const transformResult = (result: unknown): unknown => {
  return snakeToCamelCase(result);
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
