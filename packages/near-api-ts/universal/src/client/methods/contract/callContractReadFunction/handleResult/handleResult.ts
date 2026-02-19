import * as z from 'zod/mini';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc';
import { result } from '../../../../../_common/utils/result';
import { createNatError } from '../../../../../_common/natError';
import type { InnerCallContractReadFunctionArgs } from '../../../../../../types/client/methods/contract/callContractReadFunction';
import { deserializeCallResult } from './deserializeCallResult';

// For legacy reasons, nearcore returns result.error string field when
// RpcQueryError::ContractExecutionError error happens;
const ContractExecutionErrorSchema = z.object({
  blockHash: z.string(),
  blockHeight: z.number(),
  error: z.string(),
  logs: z.array(z.string()), // will always an empty array
});

const RpcQueryCallReadFunctionOkResultSchema = z.object({
  blockHash: z.string(),
  blockHeight: z.number(),
  result: z.array(z.number()),
  logs: z.array(z.string()),
});

const RpcQueryCallReadFunctionResultSchema = z.union([
  RpcQueryCallReadFunctionOkResultSchema,
  ContractExecutionErrorSchema,
]);

export const handleResult = (
  rpcResponse: RpcResponse,
  args: InnerCallContractReadFunctionArgs,
) => {
  const rpcResult = RpcQueryCallReadFunctionResultSchema.safeParse(
    rpcResponse.result,
  );

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.CallContractReadFunction.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: rpcResult.error },
          }),
        },
      }),
    );

  const { blockHash, blockHeight, logs } = rpcResult.data;

  // This will only happen for RpcQueryError::ContractExecutionError error;
  // All others are going into response.error, and we handle them in handleError;
  // https://github.com/near/nearcore/blob/a9557047d1bd45da0d06cf6b880fea6487c35e20/chain/jsonrpc/src/lib.rs#L200C13-L209C17
  if ('error' in rpcResult.data)
    return result.err(
      createNatError({
        kind: 'Client.CallContractReadFunction.Rpc.Execution.Failed',
        context: {
          contractAccountId: args.contractAccountId,
          message: rpcResult.data.error,
          blockHash,
          blockHeight,
        },
      }),
    );

  const deserializedResult = deserializeCallResult(args, rpcResult.data.result);
  if (!deserializedResult.ok) return deserializedResult;

  const output = {
    blockHash,
    blockHeight,
    logs,
    result: deserializedResult.value,
    rawResult: rpcResult.data.result,
  };

  return result.ok(output);
};
