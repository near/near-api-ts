import * as z from 'zod/mini';
import type {
  CreateMemoryVault,
  MemoryVaultContext,
  SafeCreateMemoryVault,
} from '../../../types/memoryVault/memoryVault';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { type InnerPrivateKey, PrivateKeyZodSchema } from './_common/_common/zodSchemas/privateKey';
import { keyPair } from './_common/keyPairs/keyPair/keyPair';
import { createSafeGetPublicKey } from './getPublicKey';
import { createSafeHasKeyPair } from './hasKeyPair';
import { createSafeSignData } from './signData';

// Without private keys, or with an empty list of them, the vault starts empty
const CreateMemoryVaultArgsSchema = z.optional(
  z.union([
    z.object({
      privateKey: PrivateKeyZodSchema,
    }),
    z.object({
      privateKeys: z.array(PrivateKeyZodSchema),
    }),
  ]),
);

const getPrivateKeys = (args: z.infer<typeof CreateMemoryVaultArgsSchema>): InnerPrivateKey[] => {
  if (args === undefined) return [];
  if ('privateKey' in args) return [args.privateKey];
  return args.privateKeys;
};

export const safeCreateMemoryVault: SafeCreateMemoryVault = wrapInternalError(
  'CreateMemoryVault.Internal',
  (args) => {
    const validArgs = CreateMemoryVaultArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateMemoryVault.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const context: MemoryVaultContext = {
      keyPairs: Object.fromEntries(
        getPrivateKeys(validArgs.data).map((privateKey) => {
          const kp = keyPair(privateKey.privateKey);
          return [kp.publicKey, kp];
        }),
      ),
    };

    const safeHasKeyPair = createSafeHasKeyPair(context);
    const hasKeyPair = asThrowable(safeHasKeyPair);

    const safeGetPublicKey = createSafeGetPublicKey(context);
    const getPublicKey = asThrowable(safeGetPublicKey);

    const safeSignData = createSafeSignData(context);
    const signData = asThrowable(safeSignData);

    return result.ok({
      hasKeyPair,
      safeHasKeyPair,
      getPublicKey,
      safeGetPublicKey,
      signData,
      safeSignData,
    });
  },
);

export const createMemoryVault: CreateMemoryVault = asThrowable(safeCreateMemoryVault);
