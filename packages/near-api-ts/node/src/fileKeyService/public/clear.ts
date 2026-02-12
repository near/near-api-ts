import { rm } from 'fs/promises';
import { result } from '@universal/src/_common/utils/result';

export const createSafeClear = (context: any) => async () => {
  try {
    await rm(context.rootDirPath, {
      recursive: true,
      force: true,
    });
    return result.ok(true);
  } catch (e) {
    return result.err(false);
  }
};
