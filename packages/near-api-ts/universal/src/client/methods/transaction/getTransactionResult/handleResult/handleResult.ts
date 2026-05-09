import {
  ExecutionOutcomeWithIdViewSchema,
  FinalExecutionStatusSchema,
  ReceiptViewSchema,
  SignedTransactionViewSchema,
  TxExecutionStatusSchema,
} from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import type { GetTransactionResultArgs } from '../../../../../../types/client/methods/transaction/getTransactionResult';
import type { Prettify } from '../../../../../../types/utils';
import { createNatError, resultNatError } from '../../../../../_common/natError';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc/rpc';
import { result } from '../../../../../_common/utils/result';

export const handleResult = (rpcResponse: RpcResponse, inputArgs: GetTransactionResultArgs) => {
  // const rpcResult = TransactionStatusRpcResultZodSchema.safeParse(rpcResponse.result);
  //
  // if (!rpcResult.success)
  //   return resultNatError('Client.GetTransactionResult.Exhausted', {
  //     lastError: createNatError({
  //       kind: 'SendRequest.Attempt.Response.InvalidSchema',
  //       context: { zodError: rpcResult.error },
  //     }),
  //   });

  //const tx: TransactionStatusRpcResult = rpcResult.data;
  // When tx action error happened, and tx was recorded on-chain
  // if (
  //   typeof rpcResult.data.status === 'object' &&
  //   'Failure' in rpcResult.data.status &&
  //   'ActionError' in rpcResult.data.status.Failure
  // )
  //   return handleActionError(rpcResult.data.status.Failure.ActionError, rpcResponse, inputArgs);

  const output: any = {
    rawRpcResult: rpcResponse,
  };

  return result.ok(output);
};
