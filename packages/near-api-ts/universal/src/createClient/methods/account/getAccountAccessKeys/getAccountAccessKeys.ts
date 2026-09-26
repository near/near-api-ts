import * as z from 'zod/mini';
import type {
  CreateSafeGetAccountAccessKeys,
  SafeGetAccountAccessKeys,
} from '../../../../../types/client/methods/account/getAccountAccessKeys';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { repackError } from '../../../../_common/repackError';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { toNearcoreBlockReference } from '../../_common/toNearcoreBlockReference';
import { BaseOptionsZodSchema, BlockReferenceZodSchema } from '../../_common/zodSchemas';
import { handleRpcError } from './handleRpcError';
import { handleRpcResult } from './handleRpcResult';

const GetAccountAccessKeysArgsSchema = z.object({
  accountId: AccountIdZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  options: BaseOptionsZodSchema,
});

export const createSafeGetAccountAccessKeys: CreateSafeGetAccountAccessKeys = (context) =>
  wrapInternalError(
    'Client.GetAccountAccessKeys.Internal',
    async (args): ReturnType<SafeGetAccountAccessKeys> => {
      const validArgs = GetAccountAccessKeysArgsSchema.safeParse(args);

      if (!validArgs.success)
        return result.err(
          createNatError({
            kind: 'Client.GetAccountAccessKeys.Args.InvalidSchema',
            context: { zodError: validArgs.error },
          }),
        );

      const rpcResponse = await context.sendRequest({
        method: 'query',
        params: {
          request_type: 'view_access_key_list',
          account_id: args.accountId,
          ...toNearcoreBlockReference(args.atMomentOf),
        },
        transportPolicy: args.options?.transportPolicy,
        signal: args.options?.signal,
      });

      if (!rpcResponse.success)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.GetAccountAccessKeys',
        });

      return rpcResponse.data.error
        ? handleRpcError(rpcResponse.data)
        : handleRpcResult(rpcResponse.data, args);
    },
  );
