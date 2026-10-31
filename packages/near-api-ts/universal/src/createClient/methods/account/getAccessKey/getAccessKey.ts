import * as z from 'zod/mini';
import type {
  CreateSafeGetAccessKey,
  SafeGetAccessKey,
} from '../../../../../types/client/methods/account/getAccessKey';

import { resultNatError } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { repackError } from '../../../../_common/repackError';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';
import { toNearcoreBlockReference } from '../../_common/toNearcoreBlockReference';
import { BaseOptionsZodSchema, BlockReferenceZodSchema } from '../../_common/zodSchemas';
import { handleRpcError } from './handleRpcError';
import { handleRpcResult } from './handleRpcResult';

const GetAccessKeyArgsZodSchema = z.object({
  accountId: AccountIdZodSchema,
  publicKey: PublicKeyZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  options: z.optional(BaseOptionsZodSchema),
});

export const createSafeGetAccessKey: CreateSafeGetAccessKey = (context) =>
  wrapInternalError('Client.GetAccessKey.Internal', async (args): ReturnType<SafeGetAccessKey> => {
    const validArgs = GetAccessKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('Client.GetAccessKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const rpcResponse = await context.sendRequest({
      method: 'query',
      params: {
        request_type: 'view_access_key',
        account_id: args.accountId,
        public_key: args.publicKey,
        ...toNearcoreBlockReference(args.atMomentOf),
      },
      transportPolicy: args.options?.transportPolicy,
      signal: args.options?.signal,
    });

    if (!rpcResponse.success)
      return repackError({
        error: rpcResponse.error,
        originPrefix: 'SendRequest',
        targetPrefix: 'Client.GetAccessKey',
      });

    return rpcResponse.data.error
      ? handleRpcError(rpcResponse.data)
      : handleRpcResult(rpcResponse.data, args, validArgs.data.publicKey);
  });
