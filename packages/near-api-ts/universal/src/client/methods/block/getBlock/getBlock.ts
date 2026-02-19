import { repackError } from '@universal/src/_common/utils/repackError';
import type { CreateSafeGetBlock, SafeGetBlock } from '@universal/types/client/methods/block/getBlock';
import * as z from 'zod/mini';
import { createNatError } from '../../../../_common/natError';
import { BaseOptionsSchema, BlockReferenceSchema, PoliciesSchema } from '../../../../_common/schemas/zod/client';
import { toNativeBlockReference } from '../../../../_common/transformers/toNative/blockReference';
import { result } from '../../../../_common/utils/result';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
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
  wrapInternalError(
    'Client.GetBlock.Internal',
    async (args): ReturnType<SafeGetBlock> => {
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
          originPrefix: 'SendRequest',
          targetPrefix: 'Client.GetBlock',
        });

      return rpcResponse.value.error
        ? handleError(rpcResponse.value)
        : handleResult(rpcResponse.value);
    },
  );
