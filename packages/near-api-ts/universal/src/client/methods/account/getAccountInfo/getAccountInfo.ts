import * as z from 'zod/mini';
import { toNativeBlockReference } from '../../../../_common/transformers/toNative/blockReference';
import type {
  CreateSafeGetAccountInfo,
  SafeGetAccountInfo,
} from '../../../../../types/client/methods/account/getAccountInfo';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { handleResult } from './handleResult/handleResult';
import {
  BaseOptionsSchema,
  BlockReferenceSchema,
  PoliciesSchema,
} from '../../../../_common/schemas/zod/client';
import { AccountIdSchema } from '../../../../_common/schemas/zod/common/accountId';
import { result } from '../../../../_common/utils/result';
import { createNatError } from '../../../../_common/natError';
import { handleError } from './handleError';
import { repackError } from '@universal/src/_common/utils/repackError';

const GetAccountInfoArgsSchema = z.object({
  accountId: AccountIdSchema,
  atMomentOf: z.optional(BlockReferenceSchema),
  policies: PoliciesSchema,
  options: BaseOptionsSchema,
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
        context.cache.getStoragePricePerByte(),
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
