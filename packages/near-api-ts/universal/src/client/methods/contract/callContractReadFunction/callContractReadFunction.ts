import { base64 } from '@scure/base';
import { repackError } from '@universal/src/_common/utils/repackError';
import type { CreateSafeCallContractReadFunction, InnerCallContractReadFunctionArgs, SafeCallContractReadFunction } from '@universal/types/client/methods/contract/callContractReadFunction';
import * as z from 'zod/mini';
import { createNatError } from '../../../../_common/natError';
import { BlockReferenceSchema, PoliciesSchema } from '../../../../_common/schemas/zod/client';
import { AccountIdSchema } from '../../../../_common/schemas/zod/common/accountId';
import { ContractFunctionNameSchema } from '../../../../_common/schemas/zod/common/common';
import { toNativeBlockReference } from '../../../../_common/transformers/toNative/blockReference';
import { result } from '../../../../_common/utils/result';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { handleError } from './handleError';
import { handleResult } from './handleResult/handleResult';
import { serializeFunctionArgs } from './serializeFunctionArgs';

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
      async (
        args: InnerCallContractReadFunctionArgs,
      ): ReturnType<SafeCallContractReadFunction> => {
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
          return repackError({
            error: rpcResponse.error,
            originPrefix: 'SendRequest',
            targetPrefix: 'Client.CallContractReadFunction',
          });

        return rpcResponse.value.error
          ? handleError(rpcResponse.value)
          : handleResult(rpcResponse.value, args);
      },
    );
