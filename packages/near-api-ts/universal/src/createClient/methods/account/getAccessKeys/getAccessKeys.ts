import * as z from 'zod/mini';
import type {
  CreateSafeGetAccessKeys,
  SafeGetAccessKeys,
} from '../../../../../types/client/methods/account/getAccessKeys';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { repackError } from '../../../../_common/repackError';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { toNearcoreBlockReference } from '../../_common/toNearcoreBlockReference';
import { BaseOptionsZodSchema, BlockReferenceZodSchema } from '../../_common/zodSchemas';
import { handleRpcError } from './handleRpcError';
import { handleRpcResult } from './handleRpcResult';

const GetAccessKeysArgsZodSchema = z.object({
  accountId: AccountIdZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  options: z.optional(BaseOptionsZodSchema),
});

export const createSafeGetAccessKeys: CreateSafeGetAccessKeys = (context) =>
  wrapInternalError(
    'Client.GetAccessKeys.Internal',
    async (args): ReturnType<SafeGetAccessKeys> => {
      const validArgs = GetAccessKeysArgsZodSchema.safeParse(args);

      if (!validArgs.success)
        return result.err(
          createNatError({
            kind: 'Client.GetAccessKeys.Args.InvalidSchema',
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
          targetPrefix: 'Client.GetAccessKeys',
        });

      return rpcResponse.data.error
        ? handleRpcError(rpcResponse.data)
        : handleRpcResult(rpcResponse.data, args);
    },
  );
