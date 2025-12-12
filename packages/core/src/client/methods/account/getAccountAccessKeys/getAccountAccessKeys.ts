import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type { CreateSafeGetAccountAccessKeys } from 'nat-types/client/methods/account/getAccountAccessKeys';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import {
  BaseOptionsSchema,
  BlockReferenceSchema,
  PoliciesSchema,
} from '@common/schemas/zod/client';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { repackError } from '@common/utils/repackError';
import { handleError } from './handleError';
import { handleResult } from './handleResult';

const GetAccountAccessKeysArgsSchema = z.object({
  accountId: AccountIdSchema,
  atMomentOf: z.optional(BlockReferenceSchema),
  policies: PoliciesSchema,
  options: BaseOptionsSchema,
});

export const createSafeGetAccountAccessKeys: CreateSafeGetAccountAccessKeys = (
  context,
) =>
  wrapUnknownError('Client.GetAccountAccessKeys.Unknown', async (args) => {
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
        ...toNativeBlockReference(args.atMomentOf),
      },
      transportPolicy: args.policies?.transport,
      signal: args.options?.signal,
    });

    if (!rpcResponse.ok)
      return repackError({
        error: rpcResponse.error,
        originPrefix: 'Client.Transport.SendRequest',
        targetPrefix: 'Client.GetAccountAccessKeys',
      });

    return rpcResponse.value.error
      ? handleError(rpcResponse.value)
      : handleResult(rpcResponse.value, args);
  });
