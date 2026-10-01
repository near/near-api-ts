import * as z from 'zod/mini';
import type {
  CreateSafeGetAccessKeyNonceChannels,
  SafeGetAccessKeyNonceChannels,
} from '../../../../../types/client/methods/account/getAccessKeyNonceChannels';
import { resultNatError } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { repackError } from '../../../../_common/repackError';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';
import { toNearcoreBlockReference } from '../../_common/toNearcoreBlockReference';
import { BaseOptionsZodSchema, BlockReferenceZodSchema } from '../../_common/zodSchemas';
import { handleRpcError } from './handleRpcError';
import { handleRpcResult } from './handleRpcResult';

const GetAccessKeyNonceChannelsArgsZodSchema = z.object({
  accountId: AccountIdZodSchema,
  publicKey: PublicKeyZodSchema,
  atMomentOf: z.optional(BlockReferenceZodSchema),
  options: z.optional(BaseOptionsZodSchema),
});

/**
 * A key with several nonce channels keeps their nonces outside of the access key itself, so
 * `getAccessKey` reports only `channelCount` for it. The nonces come from a method of their own.
 */
export const createSafeGetAccessKeyNonceChannels: CreateSafeGetAccessKeyNonceChannels = (context) =>
  wrapInternalError(
    'Client.GetAccessKeyNonceChannels.Internal',
    async (args): ReturnType<SafeGetAccessKeyNonceChannels> => {
      const validArgs = GetAccessKeyNonceChannelsArgsZodSchema.safeParse(args);

      if (!validArgs.success)
        return resultNatError('Client.GetAccessKeyNonceChannels.Args.InvalidSchema', {
          zodError: validArgs.error,
        });

      const rpcResponse = await context.sendRequest({
        method: 'query',
        params: {
          request_type: 'view_gas_key_nonces',
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
          targetPrefix: 'Client.GetAccessKeyNonceChannels',
        });

      return rpcResponse.data.error
        ? handleRpcError(rpcResponse.data, args)
        : handleRpcResult(rpcResponse.data, args, validArgs.data.publicKey);
    },
  );
