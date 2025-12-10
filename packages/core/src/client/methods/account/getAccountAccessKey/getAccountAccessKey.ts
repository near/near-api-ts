import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { repackError } from '@common/utils/repackError';
import {
  BaseOptionsSchema,
  BlockReferenceSchema,
  PoliciesSchema,
} from '@common/schemas/zod/client';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { handleError } from './handleError';
import { handleResult } from './handleResult';
import type { CreateSafeGetAccountAccessKey } from 'nat-types/client/methods/account/getAccountAccessKey';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';

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
  wrapUnknownError('Client.GetAccountAccessKey.Unknown', async (args) => {
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
        originPrefix: 'Client.Transport.SendRequest',
        targetPrefix: 'Client.GetAccountAccessKey',
      });

    return rpcResponse.value.error
      ? handleError(rpcResponse.value)
      : handleResult(rpcResponse.value, args);
  });
