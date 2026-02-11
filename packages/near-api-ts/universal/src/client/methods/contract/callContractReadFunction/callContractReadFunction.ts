import { base64 } from '@scure/base';
import * as z from 'zod/mini';
import { toNativeBlockReference } from '../../../../_common/transformers/toNative/blockReference';
import type {
  CreateSafeCallContractReadFunction,
  InnerCallContractReadFunctionArgs,
} from '../../../../../types/client/methods/contract/callContractReadFunction';
import { AccountIdSchema } from '../../../../_common/schemas/zod/common/accountId';
import {
  BlockReferenceSchema,
  PoliciesSchema,
} from '../../../../_common/schemas/zod/client';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { result } from '../../../../_common/utils/result';
import { createNatError } from '../../../../_common/natError';
import { handleError } from './handleError';
import { handleResult } from './handleResult/handleResult';
import { serializeFunctionArgs } from './serializeFunctionArgs';
import { ContractFunctionNameSchema } from '../../../../_common/schemas/zod/common/common';

const GetAccountAccessKeyArgsSchema = z.object({
  contractAccountId: AccountIdSchema,
  functionName: ContractFunctionNameSchema,
  functionArgs: z.optional(z.unknown()),
  withStateAt: z.optional(BlockReferenceSchema),
  policies: PoliciesSchema,
  options: z.optional(
    z.object({
      serializeArgs: z.optional(z.instanceof(Function)),
      deserializeResult: z.optional(z.instanceof(Function)),
      signal: z.optional(z.instanceof(AbortSignal)),
    }),
  ),
});

export const createSafeCallContractReadFunction: CreateSafeCallContractReadFunction =
  (context) =>
    wrapInternalError(
      'Client.CallContractReadFunction.Internal',
      async (args: InnerCallContractReadFunctionArgs) => {
        const validArgs = GetAccountAccessKeyArgsSchema.safeParse(args);

        if (!validArgs.success)
          return result.err(
            createNatError({
              kind: 'Client.CallContractReadFunction.Args.InvalidSchema',
              context: { zodError: validArgs.error },
            }),
          );

        // Try to serialize args to bytes;
        const functionArgs = serializeFunctionArgs(args);
        if (!functionArgs.ok) return functionArgs;

        const rpcResponse = await context.sendRequest({
          method: 'query',
          params: {
            request_type: 'call_function',
            account_id: args.contractAccountId,
            method_name: args.functionName,
            args_base64: base64.encode(functionArgs.value),
            ...toNativeBlockReference(args.withStateAt),
          },
          transportPolicy: args.policies?.transport,
          signal: args.options?.signal,
        });

        if (!rpcResponse.ok)
          return result.err(
            createNatError({
              kind: 'Client.CallContractReadFunction.SendRequest.Failed',
              context: { cause: rpcResponse.error },
            }),
          );

        return rpcResponse.value.error
          ? handleError(rpcResponse.value)
          : handleResult(rpcResponse.value, args);
      },
    );
