// import * as z from 'zod/mini';
import { isNatError } from '@universal/index';
import { asThrowable } from '@universal/src/_common/utils/asThrowable';
import { result } from '@universal/src/_common/utils/result';
import { wrapInternalError } from '@universal/src/_common/utils/wrapInternalError';
import type { Result } from '@universal/types/_common/common';
import type { PublicKey } from '@universal/types/_common/crypto';
import type { KeyPair } from '@universal/types/_common/keyPair/keyPair';
import { createGetKeyPair } from './private/getKeyPair';
import { openIdbConnection } from './private/openIdbConnection';
import { createSafeAddKey } from './public/addKey';
import { createSafeClear } from './public/clear';
import { createSafeHasKey } from './public/hasKey';
import { createSafeRemoveKey } from './public/removeKey';
import { createSafeSignTransaction } from './public/signTransaction';

const e = new Error('test');
isNatError(e, 'CreateIdbKeyService.Internal');

export type IdbKeyServiceContext = {
  idbName: string;
  idb?: IDBDatabase;
  keyPairs: Map<PublicKey, KeyPair>;
  getKeyPair: (publicKey: PublicKey) => Promise<Result<KeyPair, any>>;
};

export const safeCreateIdbKeyService: any = wrapInternalError(
  'CreateIdbKeyService.Internal',
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
    const safeHasKey = createSafeHasKey(context);
    const safeRemoveKey = createSafeRemoveKey(context);
    const safeClear = createSafeClear(context);
    const safeSignTransaction = createSafeSignTransaction(context);

    return result.ok({
      addKey: asThrowable(safeAddKey),
      hasKey: asThrowable(safeHasKey),
      removeKey: asThrowable(safeRemoveKey),
      clear: asThrowable(safeClear),
      signTransaction: asThrowable(safeSignTransaction),
      safeAddKey,
      safeHasKey,
      safeRemoveKey,
      safeClear,
      safeSignTransaction,
    });
  },
);

export const throwableCreateIdbKeyService: any = asThrowable(
  safeCreateIdbKeyService,
);
