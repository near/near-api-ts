import * as z from 'zod/mini';
import type {
  CreateUseGlobalContractAction,
  SafeCreateUseGlobalContractAction,
} from '../../../types/_common/transaction/actions/delegableActions/useGlobalContract';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../_common/zodSchemas/cryptoHash';

export const CreateUseGlobalContractActionArgsSchema = z.union([
  z.object({
    wasmHash: CryptoHashZodSchema,
    ownerAccountId: z.optional(z.never()),
  }),
  z.object({
    wasmHash: z.optional(z.never()),
    ownerAccountId: AccountIdZodSchema,
  }),
]);

export const safeUseGlobalContract: SafeCreateUseGlobalContractAction = wrapInternalError(
  'CreateAction.UseGlobalContract.Internal',
  (args) => {
    const validArgs = CreateUseGlobalContractActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.UseGlobalContract.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    if (validArgs.data.wasmHash)
      return result.ok({
        actionType: 'UseGlobalContract' as const,
        wasmHash: validArgs.data.wasmHash.cryptoHash,
      });

    return result.ok({
      actionType: 'UseGlobalContract' as const,
      ownerAccountId: validArgs.data.ownerAccountId,
    });
  },
);

export const throwableUseGlobalContract: CreateUseGlobalContractAction =
  asThrowable(safeUseGlobalContract);
