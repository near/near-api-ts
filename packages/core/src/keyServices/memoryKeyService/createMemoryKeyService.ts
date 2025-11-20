import { createSafeSignTransaction } from './createSafeSignTransaction';
import { safeParseKeySources } from './safeParseKeySources';
import { createSafeFindPrivateKey } from './createSafeFindPrivateKey';
import { asThrowable } from '@common/utils/asThrowable';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type {
  Context,
  CreateMemoryKeyService,
  SafeCreateMemoryKeyService,
} from 'nat-types/keyServices/memoryKeyService';

export const safeCreateMemoryKeyService: SafeCreateMemoryKeyService =
  wrapUnknownError(async (args) => {
    const keyPairs = safeParseKeySources(args);
    if (!keyPairs.ok) return keyPairs;

    const context: Context = {
      keyPairs: keyPairs.value,
    } as Context;

    const safeFindPrivateKey = createSafeFindPrivateKey(context);
    const safeSignTransaction = createSafeSignTransaction(context);

    context.safeFindPrivateKey = safeFindPrivateKey;

    return result.ok({
      signTransaction: asThrowable(safeSignTransaction),
      findPrivateKey: asThrowable(safeFindPrivateKey),
      safe: {
        signTransaction: safeSignTransaction,
        findPrivateKey: safeFindPrivateKey,
      },
    });
  });

export const createMemoryKeyService: CreateMemoryKeyService = asThrowable(
  safeCreateMemoryKeyService,
);
