import { repackError } from '@universal/src/_common/utils/repackError';
import type { CreateSafeGetAccountAccessKeys, SafeGetAccountAccessKeys } from '@universal/types/client/methods/account/getAccountAccessKeys';
import * as z from 'zod/mini';
import { createNatError } from '../../../../_common/natError';
import { BaseOptionsSchema, BlockReferenceSchema, PoliciesSchema } from '../../../../_common/schemas/zod/client';
import { AccountIdSchema } from '../../../../_common/schemas/zod/common/accountId';
import { toNativeBlockReference } from '../../../../_common/transformers/toNative/blockReference';
import { result } from '../../../../_common/utils/result';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
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
          ...toNativeBlockReference(args.atMomentOf),
        },
        transportPolicy: args.policies?.transport,
        signal: args.options?.signal,
      });

      if (!rpcResponse.ok)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.GetAccountAccessKeys',
        });

      return rpcResponse.value.error
        ? handleError(rpcResponse.value)
        : handleResult(rpcResponse.value, args);
    },
  );
