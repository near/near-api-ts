import { createSafeSignTransaction } from './createSignTransaction';
import { getKeyPairs } from './getKeyPairs';
import { createSafeFindKeyPair } from './createFindKeyPair';
import { asThrowable } from '@common/utils/asThrowable';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type { MemoryKeyServiceContext } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type {
  CreateMemoryKeyService,
  SafeCreateMemoryKeyService,
} from 'nat-types/keyServices/memoryKeyService/createMemoryKeyService';

export const safeCreateMemoryKeyService: SafeCreateMemoryKeyService =
  wrapUnknownError('CreateMemoryKeyService.Unknown', async (args) => {
    // TODO Validate args

    const context = {
      keyPairs: getKeyPairs(args),
    } as MemoryKeyServiceContext;

    const safeFindKeyPair = createSafeFindKeyPair(context);
    const safeSignTransaction = createSafeSignTransaction(context);

    context.safeFindKeyPair = safeFindKeyPair;

    return result.ok({
      signTransaction: asThrowable(safeSignTransaction),
      findKeyPair: asThrowable(safeFindKeyPair),
      safe: {
        signTransaction: safeSignTransaction,
        findKeyPair: safeFindKeyPair,
      },
    });
  });

export const createMemoryKeyService: CreateMemoryKeyService = asThrowable(
  safeCreateMemoryKeyService,
);
