import * as z from 'zod/mini';
import type {
  CreateSafeGetAccountAccessKeys,
  SafeGetAccountAccessKeys,
} from '../../../../../types/client/methods/account/getAccountAccessKeys';
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
import { handleResult } from './handleResult';

const GetAccountAccessKeysArgsSchema = z.object({
  accountId: AccountIdZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  policies: PoliciesZodSchema,
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
