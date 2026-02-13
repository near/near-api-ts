import { result } from '@universal/src/_common/utils/result';
import type { IdbKeyServiceContext } from '../idbKeyService';

export const createSafeClear = (context: IdbKeyServiceContext) => async () => {
  if (!context.idb) return result.err(false); // TODO wait until idb is ready

  const transaction = context.idb.transaction(['keyPairs'], 'readwrite');
  const keyPairs = transaction.objectStore('keyPairs');

  keyPairs.clear();

  return result.ok(true);
};
