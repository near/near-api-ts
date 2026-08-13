import { result } from '../../../../universal/src/_common/_common/result';
import type { IdbKeyServiceContext } from '../idbKeyService';

export const createSafeHasKey = (context: IdbKeyServiceContext) => async (args: any) => {
  const keyPair = await context.getKeyPair(args.publicKey);
  /// TODO rework
  return result.ok(keyPair.ok);
};
