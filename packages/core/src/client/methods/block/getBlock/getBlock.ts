import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type { CreateSafeGetBlock } from 'nat-types/client/methods/block/getBlock';
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

const GetBlockArgsSchema = z.optional(
  z.object({
    blockReference: z.optional(BlockReferenceSchema),
    policies: PoliciesSchema,
    options: BaseOptionsSchema,
  }),
);

export const createSafeGetBlock: CreateSafeGetBlock = (context) =>
  wrapUnknownError('Client.GetBlock.Unknown', async (args) => {
    const validArgs = GetBlockArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'Client.GetBlock.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const rpcResponse = await context.sendRequest({
      method: 'block',
      params: toNativeBlockReference(args?.blockReference),
      transportPolicy: args?.policies?.transport,
      signal: args?.options?.signal,
    });

    if (!rpcResponse.ok)
      return repackError({
        error: rpcResponse.error,
        originPrefix: 'Client.Transport.SendRequest',
        targetPrefix: 'Client.GetBlock',
      });

    return rpcResponse.value.error
      ? handleError(rpcResponse.value)
      : handleResult(rpcResponse.value);
  });
