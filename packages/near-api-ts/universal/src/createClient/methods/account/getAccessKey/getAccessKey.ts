import * as z from 'zod/mini';
import type {
  CreateSafeGetAccessKey,
  SafeGetAccessKey,
} from '../../../../../types/client/methods/account/getAccessKey';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { repackError } from '../../../../_common/repackError';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';
import { toNearcoreBlockReference } from '../../_common/toNearcoreBlockReference';
import { BaseOptionsZodSchema, BlockReferenceZodSchema } from '../../_common/zodSchemas';
import { handleRpcError } from './handleRpcError';
import { handleRpcResult } from './handleRpcResult';

const GetAccessKeyArgsSchema = z.object({
  accountId: AccountIdZodSchema,
  publicKey: PublicKeyZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  options: BaseOptionsZodSchema,
});

export const createSafeGetAccessKey: CreateSafeGetAccessKey = (context) =>
  wrapInternalError('Client.GetAccessKey.Internal', async (args): ReturnType<SafeGetAccessKey> => {
    const validArgs = GetAccessKeyArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'Client.GetAccessKey.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

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
