import { keyPair } from '@universal/index';
import { result } from '@universal/src/_common/utils/result';
import type { IdbKeyServiceContext } from '../idbKeyService';

export const createSafeAddKey =
  (context: IdbKeyServiceContext) => async (args: any) => {
    if (!context.idb) return result.err(false); // TODO wait until idb is ready

    const kp = keyPair(args.privateKey);

    // 2. Put the private key to the Idb
    const request = context.idb
      .transaction(['keyPairs'], 'readwrite')
      .objectStore('keyPairs')
      .put(kp.privateKey, kp.publicKey);

    await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('Key added', request.result);
        context.keyPairs.set(kp.publicKey, kp);

        resolve(result.ok(request.result));
      };

      request.onerror = () => {
        console.log('Error while adding key', request.error);
        reject(request.error);
      };
    });


    return result.ok(kp);
  };
