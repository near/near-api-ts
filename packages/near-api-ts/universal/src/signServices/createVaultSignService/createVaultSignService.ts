import * as z from 'zod/mini';
import type {
  CreateVaultSignService,
  SafeCreateVaultSignService,
} from '../../../types/vaultSignService/vaultSignService';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { createSafeGetPublicKey } from './getPublicKey';
import { createSafeHasKeyPair } from './hasKeyPair';
import { createSafeSignDelegation } from './signDelegation';
import { createSafeSignTransaction } from './signTransaction';

const CreateVaultSignServiceArgsZodSchema = z.object({
  vault: z.object({
    safeHasKeyPair: z.function(),
    safeGetPublicKey: z.function(),
    safeSignData: z.function(),
  }),
});

export const safeCreateVaultSignService: SafeCreateVaultSignService = wrapInternalError(
  'CreateVaultSignService.Internal',
  (args) => {
    const validArgs = CreateVaultSignServiceArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateVaultSignService.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    // The vault itself - the parsed copy keeps only the methods the schema names, wrapped
    const context = { vault: args.vault };

    const safeHasKeyPair = createSafeHasKeyPair(context);
    const hasKeyPair = asThrowable(safeHasKeyPair);

    const safeGetPublicKey = createSafeGetPublicKey(context);
    const getPublicKey = asThrowable(safeGetPublicKey);

    const safeSignTransaction = createSafeSignTransaction(context);
    const signTransaction = asThrowable(safeSignTransaction);

    const safeSignDelegation = createSafeSignDelegation(context);
    const signDelegation = asThrowable(safeSignDelegation);

    return result.ok({
      vault: context.vault,
      hasKeyPair,
      safeHasKeyPair,
      getPublicKey,
      safeGetPublicKey,
      signTransaction,
      safeSignTransaction,
      signDelegation,
      safeSignDelegation,
    });
  },
);

export const createVaultSignService: CreateVaultSignService = asThrowable(
  safeCreateVaultSignService,
);
