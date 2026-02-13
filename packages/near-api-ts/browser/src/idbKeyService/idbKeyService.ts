// import * as z from 'zod/mini';
import { result } from '@universal/src/_common/utils/result';
import { wrapInternalError } from '@universal/src/_common/utils/wrapInternalError';
import { openIdbConnection } from './private/openIdbConnection';
import type { KeyPair } from '@universal/types/_common/keyPair/keyPair';
import type { PublicKey } from '@universal/types/_common/crypto';
import { createSafeAddKey } from './public/addKey';
import { asThrowable } from '@universal/src/_common/utils/asThrowable';
import { createSafeClear } from './public/clear';
import { createGetKeyPair } from './private/getKeyPair';
import type { Result } from '@universal/types/_common/common';
import { createSafeSignTransaction } from './public/signTransaction';

export type IdbKeyServiceContext = {
  idbName: string;
  idb?: IDBDatabase;
  keyPairs: Map<PublicKey, KeyPair>;
  getKeyPair: (publicKey: PublicKey) => Promise<Result<KeyPair, any>>;
};

export const safeCreateIdbKeyService: any = wrapInternalError(
  'CreateFileKeyService.Internal',
  (args?: any) => {
    // validate

    const context = {
      idbName: args?.idbName ?? 'near-api-ts',
      idb: undefined,
      keyPairs: new Map(),
    } as IdbKeyServiceContext;

    openIdbConnection(context);

    context.getKeyPair = createGetKeyPair(context);

    const safeAddKey = createSafeAddKey(context);
    // const safeHasKeyPair = createSafeAddKeyPair(context);
    // const safeRemoveKeyPair = createSafeRemoveKeyPair(context);
    const safeClear = createSafeClear(context);
    const safeSignTransaction = createSafeSignTransaction(context);

    return result.ok({
      addKey: asThrowable(safeAddKey),
      // hasKeyPair: asThrowable(safeHasKeyPair),
      // removeKeyPair: asThrowable(safeRemoveKeyPair),
      clear: asThrowable(safeClear),
      signTransaction: asThrowable(safeSignTransaction),
      safeAddKey,
      // safeHasKeyPair,
      // safeRemoveKeyPair,
      safeClear,
      safeSignTransaction,
    });
  },
);

export const throwableCreateIdbKeyService: any = asThrowable(
  safeCreateIdbKeyService,
);
