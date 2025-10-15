import { base64 } from '@scure/base';
import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { CallResultSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { fromJsonBytes, toJsonBytes } from '@common/utils/common';
import type {
  CreateCallContractReadFunction,
  BaseDeserializeResult,
  InnerCallContractReadFunctionArgs,
} from 'nat-types/client/methods/contract/callContractReadFunction';

const baseDeserializeResul: BaseDeserializeResult = ({ rawResult }) =>
  fromJsonBytes(rawResult);

const RpcCallFunctionResponseSchema = z.object({
  ...CallResultSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: InnerCallContractReadFunctionArgs,
) => {
  const camelCased = snakeToCamelCase(result);
  console.log('camelCased', camelCased);
  const valid = RpcCallFunctionResponseSchema.parse(camelCased);

  const transformer = args?.options?.deserializeResult
    ? args.options.deserializeResult
    : baseDeserializeResul;

  return {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    result: transformer({ rawResult: valid.result }),
    logs: valid.logs,
  };
};

const serializeFunctionArgs = (args: InnerCallContractReadFunctionArgs) => {
  if (args?.options?.serializeArgs)
    return args.options.serializeArgs({ functionArgs: args.functionArgs });

  if (args?.functionArgs) return toJsonBytes(args?.functionArgs);

  return new Uint8Array();
};

export const createCallContractReadFunction: CreateCallContractReadFunction =
  ({ sendRequest }) =>
  async (args: InnerCallContractReadFunctionArgs) => {
    const result = await sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'call_function',
          account_id: args.contractAccountId,
          method_name: args.functionName,
          args_base64: base64.encode(serializeFunctionArgs(args)),
          ...toNativeBlockReference(args.withStateAt),
        },
      },
    });
    return transformResult(result, args);
  };
