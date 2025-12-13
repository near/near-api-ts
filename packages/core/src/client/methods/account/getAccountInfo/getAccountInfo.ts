import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type { CreateSafeGetAccountInfo } from 'nat-types/client/methods/account/getAccountInfo';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { handleResult } from './handleResult';
import {
  BaseOptionsSchema,
  BlockReferenceSchema,
  PoliciesSchema,
} from '@common/schemas/zod/client';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { handleError } from './handleError';

// NextFeature: Add ability to fetch detailed balance with 'available' field

const GetAccountInfoArgsSchema = z.object({
  accountId: AccountIdSchema,
  atMomentOf: z.optional(BlockReferenceSchema),
  policies: PoliciesSchema,
  options: BaseOptionsSchema,
});

export const createSafeGetAccountInfo: CreateSafeGetAccountInfo = (context) =>
  wrapInternalError('Client.GetAccountInfo.Internal', async (args) => {
    const validArgs = GetAccountInfoArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'Client.GetAccountInfo.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const { accountId, policies, options } = validArgs.data;

    const rpcResponse = await context.sendRequest({
      method: 'query',
      params: {
        request_type: 'view_account',
        account_id: accountId,
        ...toNativeBlockReference(args.atMomentOf),
      },
      transportPolicy: policies?.transport,
      signal: options?.signal,
    });

    if (!rpcResponse.ok)
      return result.err(
        createNatError({
          kind: 'Client.GetAccountInfo.SendRequest.Failed',
          context: { cause: rpcResponse.error },
        }),
      );

    return rpcResponse.value.error
      ? handleError(rpcResponse.value)
      : handleResult(rpcResponse.value, args);
  });
