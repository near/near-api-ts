import * as z from 'zod/mini';
import type {
  CreateSafeGetAccountInfo,
  SafeGetAccountInfo,
} from '../../../../../types/client/methods/account/getAccountInfo';

import { resultNatError } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { repackError } from '../../../../_common/repackError';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { toNearcoreBlockReference } from '../../_common/toNearcoreBlockReference';
import { BaseOptionsZodSchema, BlockReferenceZodSchema } from '../../_common/zodSchemas';
import { handleRpcError } from './handleRpcError';
import { handleRpcResult } from './handleRpcResult/handleRpcResult';

const GetAccountInfoArgsZodSchema = z.object({
  accountId: AccountIdZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  options: z.optional(BaseOptionsZodSchema),
});

export const createSafeGetAccountInfo: CreateSafeGetAccountInfo = (context) =>
  wrapInternalError(
    'Client.GetAccountInfo.Internal',
    async (args): ReturnType<SafeGetAccountInfo> => {
      const validArgs = GetAccountInfoArgsZodSchema.safeParse(args);

      if (!validArgs.success)
        return resultNatError('Client.GetAccountInfo.Args.InvalidSchema', {
          zodError: validArgs.error,
        });

      const { accountId, options } = validArgs.data;

      const [rpcResponse, storagePricePerByte] = await Promise.all([
        context.sendRequest({
          method: 'query',
          params: {
            request_type: 'view_account',
            account_id: accountId,
            ...toNearcoreBlockReference(args.atMomentOf),
          },
          transportPolicy: options?.transportPolicy,
          signal: options?.signal,
        }),
        context.cache.getStoragePricePerByte({
          signal: options?.signal,
        }),
      ]);

      if (!rpcResponse.success)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.GetAccountInfo',
        });

      if (!storagePricePerByte.success)
        return resultNatError('Client.GetAccountInfo.StoragePricePerByte.NotLoaded', {
          cause: storagePricePerByte.error,
        });

      return rpcResponse.data.error
        ? handleRpcError(rpcResponse.data)
        : handleRpcResult(rpcResponse.data, storagePricePerByte.data, args);
    },
  );
