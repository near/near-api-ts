import { base64 } from '@scure/base';
import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { CryptoHashSchema } from '@near-js/jsonrpc-types';
import { fromJsonBytes, toJsonBytes } from '@common/utils/common';
import type {
  CreateCallContractReadFunction,
  BaseDeserializeResult,
  InnerCallContractReadFunctionArgs,
} from 'nat-types/client/methods/contract/callContractReadFunction';
import { NatError } from '../../transport/defaultTransportError';

const baseDeserializeResul: BaseDeserializeResult = ({ rawResult }) =>
  fromJsonBytes(rawResult);

const BaseSchema = z.object({
  logs: z.array(z.string()),
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const RpcCallFunctionResponseSchema = z.union([
  z.object({ ...BaseSchema.shape, result: z.array(z.number()) }),
  z.object({ ...BaseSchema.shape, error: z.string() }),
]);

const transformResult = (
  result: unknown,
  args: InnerCallContractReadFunctionArgs,
) => {
  const valid = RpcCallFunctionResponseSchema.parse(result);

  if ('error' in valid)
    throw new NatError({
      code: 'ContractExecutionError',
      message: `Contract read function call failed: ${valid.error}`,
      cause: valid,
    });

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
      method: 'query',
      params: {
        request_type: 'call_function',
        account_id: args.contractAccountId,
        method_name: args.functionName,
        args_base64: base64.encode(serializeFunctionArgs(args)),
        ...toNativeBlockReference(args.withStateAt),
      },
    });
    return transformResult(result, args);
  };
