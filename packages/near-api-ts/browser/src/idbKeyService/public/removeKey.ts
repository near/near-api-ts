import { result } from '@universal/src/_common/utils/result';
import type { IdbKeyServiceContext } from '../idbKeyService';

export const createSafeRemoveKey =
  (context: IdbKeyServiceContext) =>
  async (args: any): Promise<any> => {
    if (!context.idb) return result.err(false); // TODO wait until idb is ready

    const request = context.idb
      .transaction('keyPairs', 'readwrite')
      .objectStore('keyPairs')
      .delete(args.publicKey);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        console.log('Key deleted', request.result);
        context.keyPairs.delete(args.publicKey);
        resolve(result.ok(request.result));
      };

      request.onerror = () => {
        console.log('Error while deleting key', request.error);
        resolve(result.err(request.error));
      };
    });
  };
