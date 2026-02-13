import { keyPair } from '@universal/index';
import { result } from '@universal/src/_common/utils/result';
import type { IdbKeyServiceContext } from '../idbKeyService';

export const createSafeAddKey =
  (context: IdbKeyServiceContext) => async (args: any) => {
    if (!context.idb) return result.err(false); // TODO wait until idb is ready

    const kp = keyPair(args.privateKey);

    // 2. Put the private key to the Idb
    const transaction = context.idb.transaction(['keyPairs'], 'readwrite');
    const keyPairs = transaction.objectStore('keyPairs');

    const request = keyPairs.put(kp.privateKey, kp.publicKey);

    await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('Key added', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.log('Error while adding key', request.error);
        reject(request.error);
      };
    });

    // 4. Add the key to the cache
    context.keyPairs.set(kp.publicKey, kp);

    return result.ok(kp);
  };
