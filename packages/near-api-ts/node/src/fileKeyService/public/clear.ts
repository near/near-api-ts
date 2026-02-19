import { result } from '@universal/src/_common/utils/result';
import { rm } from 'fs/promises';

export const createSafeClear = (context: any) => async () => {
  try {
    await rm(context.rootDirPath, {
      recursive: true,
      force: true,
    });
    // todo clear cache

    return result.ok(true);
  } catch (e) {
    return result.err(false);
  }
};
