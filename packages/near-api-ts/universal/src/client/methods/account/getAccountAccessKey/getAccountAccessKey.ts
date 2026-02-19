import { repackError } from '@universal/src/_common/utils/repackError';
import type { CreateSafeGetAccountAccessKey, SafeGetAccountAccessKey } from '@universal/types/client/methods/account/getAccountAccessKey';
import * as z from 'zod/mini';
import { createNatError } from '../../../../_common/natError';
import { BaseOptionsSchema, BlockReferenceSchema, PoliciesSchema } from '../../../../_common/schemas/zod/client';
import { AccountIdSchema } from '../../../../_common/schemas/zod/common/accountId';
import { PublicKeySchema } from '../../../../_common/schemas/zod/common/publicKey';
import { toNativeBlockReference } from '../../../../_common/transformers/toNative/blockReference';
import { result } from '../../../../_common/utils/result';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { handleError } from './handleError';
import { handleResult } from './handleResult';

const GetAccountAccessKeyArgsSchema = z.object({
  accountId: AccountIdSchema,
  publicKey: PublicKeySchema,
  atMomentOf: z.optional(BlockReferenceSchema),
  policies: PoliciesSchema,
  options: BaseOptionsSchema,
});

export const createSafeGetAccountAccessKey: CreateSafeGetAccountAccessKey = (
  context,
) =>
  wrapInternalError(
    'Client.GetAccountAccessKey.Internal',
    async (args): ReturnType<SafeGetAccountAccessKey> => {
      const validArgs = GetAccountAccessKeyArgsSchema.safeParse(args);

      if (!validArgs.success)
        return result.err(
          createNatError({
            kind: 'Client.GetAccountAccessKey.Args.InvalidSchema',
            context: { zodError: validArgs.error },
          }),
        );

      const rpcResponse = await context.sendRequest({
        method: 'query',
        params: {
          request_type: 'view_access_key',
          account_id: args.accountId,
          public_key: args.publicKey,
          ...toNativeBlockReference(args.atMomentOf),
        },
        transportPolicy: args.policies?.transport,
        signal: args.options?.signal,
      });

      if (!rpcResponse.ok)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.GetAccountAccessKey',
        });

      return rpcResponse.value.error
        ? handleError(rpcResponse.value)
        : handleResult(rpcResponse.value, args);
    },
  );
