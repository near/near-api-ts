import { result } from '@universal/src/_common/utils/result';
import { rm } from 'fs/promises';
import path from 'path';

export const createSafeRemoveKeyPair = (context: any) => async (args: any) => {
  const fullFilePath = path.join(context.rootDirPath, args.publicKey);

  try {
    await rm(fullFilePath, { force: true });
    // todo remove from cache

    return result.ok(true);
  } catch (e) {
    return result.err(false);
  }
};
