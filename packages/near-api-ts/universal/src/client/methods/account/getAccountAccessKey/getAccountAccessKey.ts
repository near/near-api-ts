import * as z from 'zod/mini';
import type {
  CreateSafeGetAccountAccessKey,
  SafeGetAccountAccessKey,
} from '../../../../../types/client/methods/account/getAccountAccessKey';
import { createNatError } from '../../../../_common/natError';
import {
  BaseOptionsZodSchema,
  BlockReferenceZodSchema,
  PoliciesZodSchema,
} from '../../../../_common/schemas/zod/client';
import { AccountIdZodSchema } from '../../../../_common/schemas/zod/common/accountId';
import { PublicKeyZodSchema } from '../../../../_common/schemas/zod/common/publicKey';
import { toNativeBlockReference } from '../../../../_common/transformers/toNative/blockReference';
import { repackError } from '../../../../_common/utils/repackError';
import { result } from '../../../../_common/utils/result';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { handleError } from './handleError';
import { handleResult } from './handleResult';

const GetAccountAccessKeyArgsSchema = z.object({
  accountId: AccountIdZodSchema,
  publicKey: PublicKeyZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  policies: PoliciesZodSchema,
  options: BaseOptionsZodSchema,
});

export const createSafeGetAccountAccessKey: CreateSafeGetAccountAccessKey = (context) =>
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
