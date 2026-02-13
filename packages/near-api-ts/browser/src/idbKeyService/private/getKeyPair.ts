import { keyPair } from '@universal/index';
import { result } from '@universal/src/_common/utils/result';
import type { IdbKeyServiceContext } from '../idbKeyService';

export const createGetKeyPair =
  (context: IdbKeyServiceContext) => async (publicKey: any) => {
    // 1. If the key pair is already in the cache, return it
    if (context.keyPairs.has(publicKey))
      return result.ok(context.keyPairs.get(publicKey));

    if (!context.idb) return result.err(false); // TODO wait until idb is ready

    // 2. Read the private key from the idb
    const transaction = context.idb.transaction(['keyPairs'], 'readonly');
    const keyPairs = transaction.objectStore('keyPairs');

    const request = keyPairs.get(publicKey);

    const privateKey: any = await new Promise((resolve) => {
      request.onsuccess = () => {
        console.log('Key found', request.result);
        resolve(result.ok(request.result));
      };
      request.onerror = () => {
        console.log('Error while getting key', request.error);
        resolve(result.err(request.error));
      };
    });

    if (!privateKey.ok) return privateKey;

    // 3. Save the key pair to the cache
    const kp = keyPair(privateKey.value);
    context.keyPairs.set(kp.publicKey, kp);

    return result.ok(kp);
  };
