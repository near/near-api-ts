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
  RawCallResult,
  BaseTransformFn,
  CallContractReadFunction,
} from 'nat-types/client/contract/callContractReadFunction';

const RpcCallFunctionResponseSchema = z.object({
  ...CallResultSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

// const getTransformedCallResult = <Args, Result>(
//   args: CallContractReadFunctionArgs<Args, Result>,
//   rawCallResult: RawCallResult,
//   transformer: (v: RawCallResult) => Result,
// ) =>
//   args?.client?.response?.resultTransformer
//     ? args.client?.response.resultTransformer(rawCallResult)
//     : (fromJsonBytes(rawCallResult));

// const transformResult = <Result>(
//   result: unknown,
//   transformer: (v: RawCallResult) => Result,
// ): CallContractReadFunctionResult<Result> => {
//   const camelCased = snakeToCamelCase(result);
//   const valid = RpcCallFunctionResponseSchema.parse(camelCased);
//
//   return {
//     blockHash: valid.blockHash,
//     blockHeight: valid.blockHeight,
//     result: transformer(valid.result),
//     logs: valid.logs,
//   };
// };

const defaultTransformer: BaseTransformFn = (v: RawCallResult) =>
  fromJsonBytes(v);

export const createCallContractReadFunction: CreateCallContractReadFunction = ({
  sendRequest,
}) =>
  (async <A, F extends BaseTransformFn>(args: Args<A, F>) => {
    const result = await sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'call_function',
          account_id: args.contractAccountId,
          method_name: args.fnName,
          args_base64: base64.encode(toContractFnArgsBytes<A>(args)),
          ...toNativeBlockReference(args.blockReference),
        },
      },
    });

    if (args?.resultTransformer) {
      const camelCased = snakeToCamelCase(result);
      const valid = RpcCallFunctionResponseSchema.parse(camelCased);

      return {
        blockHash: valid.blockHash,
        blockHeight: valid.blockHeight,
        result: args.resultTransformer(valid.result),
        logs: valid.logs,
      };
    }

    const camelCased = snakeToCamelCase(result);
    const valid = RpcCallFunctionResponseSchema.parse(camelCased);

    return {
      blockHash: valid.blockHash,
      blockHeight: valid.blockHeight,
      result: defaultTransformer(valid.result),
      logs: valid.logs,
    };
  }) as CallContractReadFunction;
