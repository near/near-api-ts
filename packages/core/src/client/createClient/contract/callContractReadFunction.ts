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
  MaybeBaseResultTransformer,
  BaseResultTransformer,
} from 'nat-types/client/contract/callContractReadFunction';
import type { MaybeJsonLikeValue } from 'nat-types/common';

const baseResultTransformer: BaseResultTransformer = ({ rawResult }) =>
  fromJsonBytes(rawResult);

const RpcCallFunctionResponseSchema = z.object({
  ...CallResultSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = <
  AJ extends MaybeJsonLikeValue,
  F extends MaybeBaseResultTransformer,
>(
  result: unknown,
  args: Args<AJ, F>,
) => {
  const camelCased = snakeToCamelCase(result);
  const valid = RpcCallFunctionResponseSchema.parse(camelCased);

  const transformer = args.response?.resultTransformer
    ? args.response.resultTransformer
    : baseResultTransformer;

  return {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    result: transformer({ rawResult: valid.result }),
    logs: valid.logs,
  };
};

export const createCallContractReadFunction: CreateCallContractReadFunction = ({
  sendRequest,
}) =>
  (async <
    AJ extends MaybeJsonLikeValue = undefined,
    F extends MaybeBaseResultTransformer = undefined,
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
          ...toNativeBlockReference(args.withStateAt),
        },
      },
    });
    return transformResult<AJ, F>(result, args);
  }) as CallContractReadFunction;
