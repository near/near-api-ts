import * as z from 'zod/mini';
import type {
  CreateSafeGetAccountInfo,
  SafeGetAccountInfo,
} from '../../../../../types/client/methods/account/getAccountInfo';
import { createNatError } from '../../../../_common/_common/_common/natError';
import { repackError } from '../../../../_common/_common/repackError';
import { result } from '../../../../_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { toNativeBlockReference } from '../../../../signServices/signTransaction/toNative/blockReference';
import {
  BaseOptionsZodSchema,
  BlockReferenceZodSchema,
  PoliciesZodSchema,
} from '../../_common/zodSchemas';
import { handleError } from './handleError';
import { handleResult } from './handleResult/handleResult';

const GetAccountInfoArgsSchema = z.object({
  accountId: AccountIdZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  policies: PoliciesZodSchema,
  options: BaseOptionsZodSchema,
});

export const createSafeGetAccountInfo: CreateSafeGetAccountInfo = (context) =>
  wrapInternalError(
    'Client.GetAccountInfo.Internal',
    async (args): ReturnType<SafeGetAccountInfo> => {
      const validArgs = GetAccountInfoArgsSchema.safeParse(args);

      if (!validArgs.success)
        return result.err(
          createNatError({
            kind: 'Client.GetAccountInfo.Args.InvalidSchema',
            context: { zodError: validArgs.error },
          }),
        );

      const { accountId, policies, options } = validArgs.data;

      const [rpcResponse, storagePricePerByte] = await Promise.all([
        context.sendRequest({
          method: 'query',
          params: {
            request_type: 'view_account',
            account_id: accountId,
            ...toNativeBlockReference(args.atMomentOf),
          },
          transportPolicy: policies?.transport,
          signal: options?.signal,
        }),
        context.cache.getStoragePricePerByte({
          signal: options?.signal,
        }),
      ]);

      if (!rpcResponse.ok)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.GetAccountInfo',
        });

      if (!storagePricePerByte.ok)
        return result.err(
          createNatError({
            kind: 'Client.GetAccountInfo.StoragePricePerByte.NotLoaded',
            context: { cause: storagePricePerByte.error },
          }),
        );

      return rpcResponse.value.error
        ? handleError(rpcResponse.value)
        : handleResult(rpcResponse.value, storagePricePerByte.value, args);
    },
  );
