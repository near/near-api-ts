import { safeKeyPair } from '@universal/index';
import { result } from '@universal/src/_common/utils/result';
import type { IdbKeyServiceContext } from '../idbKeyService';

export const createGetKeyPair =
  (context: IdbKeyServiceContext) => async (publicKey: any): Promise<any> => {
    // 1. If the key pair is already in the cache, return it
    if (context.keyPairs.has(publicKey))
      return result.ok(context.keyPairs.get(publicKey));

    if (!context.idb) return result.err(false); // TODO wait until idb is ready

    // 2. Read the private key from the idb
    const request = context.idb
      .transaction('keyPairs', 'readonly')
      .objectStore('keyPairs')
      .get(publicKey);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        console.log('Key:', request.result);
        if (!request.result) return resolve(result.err(false)); //Key.NotFound

        // Try to create a key pair from the stored private key
        const kp = safeKeyPair(request.result);
        if (!kp.ok) return resolve(result.err(kp.error)); // Internal, should never happen

        context.keyPairs.set(kp.value.publicKey, kp.value);
        resolve(result.ok(kp.value));
      };

      // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/get#exceptions
      request.onerror = () => {
        console.log('Error while getting key', request.error);
        resolve(result.err(request.error)); // Internal
      };
    });
  };
