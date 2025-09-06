import { base64 } from '@scure/base';
import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { CallResultSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { toContractFnArgsBytes } from '@common/transformers/contract';
import { fromJsonBytes } from '@common/utils/common';
import type {
  CreateCallContractReadFunction,
  Args,
  CallContractReadFunction,
  MaybeBaseTransformFn,
} from 'nat-types/client/contract/callContractReadFunction';
import type { MaybeJsonLikeValue } from 'nat-types/common';

const RpcCallFunctionResponseSchema = z.object({
  ...CallResultSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = <
  AJ extends MaybeJsonLikeValue,
  F extends MaybeBaseTransformFn,
>(
  result: unknown,
  args: Args<AJ, F>,
) => {
  const camelCased = snakeToCamelCase(result);
  const valid = RpcCallFunctionResponseSchema.parse(camelCased);

  const transformer = args.response?.resultTransformer
    ? args.response.resultTransformer
    : fromJsonBytes;

  return {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    result: transformer(valid.result),
    logs: valid.logs,
  };
};

export const createCallContractReadFunction: CreateCallContractReadFunction = ({
  sendRequest,
}) =>
  (async <
    AJ extends MaybeJsonLikeValue = undefined,
    F extends MaybeBaseTransformFn = undefined,
  >(
    args: Args<AJ, F>,
  ) => {
    const result = await sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'call_function',
          account_id: args.contractAccountId,
          method_name: args.fnName,
          args_base64: base64.encode(toContractFnArgsBytes<AJ>(args)),
          ...toNativeBlockReference(args.blockReference),
        },
      },
    });
    return transformResult<AJ, F>(result, args);
  }) as CallContractReadFunction;
