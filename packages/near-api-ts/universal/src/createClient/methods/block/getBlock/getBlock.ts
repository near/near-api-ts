import * as z from 'zod/mini';
import type {
  CreateSafeGetBlock,
  SafeGetBlock,
} from '../../../../../types/client/methods/block/getBlock';
import { createNatError } from '../../../../_common/_common/_common/natError';
import { repackError } from '../../../../_common/_common/repackError';
import { result } from '../../../../_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { toNearcoreBlockReference } from '../../_common/toNearcoreBlockReference';
import {
  BaseOptionsZodSchema,
  BlockReferenceZodSchema,
  PoliciesZodSchema,
} from '../../_common/zodSchemas';
import { handleError } from './handleError';
import { handleResult } from './handleResult';

const GetBlockArgsSchema = z.optional(
  z.object({
    blockReference: z.optional(BlockReferenceZodSchema),
    policies: PoliciesZodSchema,
    options: BaseOptionsZodSchema,
  }),
);

export const createSafeGetBlock: CreateSafeGetBlock = (context) =>
  wrapInternalError('Client.GetBlock.Internal', async (args): ReturnType<SafeGetBlock> => {
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
      params: toNearcoreBlockReference(args?.blockReference),
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
  });
