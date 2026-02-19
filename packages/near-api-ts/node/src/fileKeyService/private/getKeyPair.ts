import { keyPair } from '@universal/index';
import { result } from '@universal/src/_common/utils/result';
import { readFile } from 'node:fs/promises';
import path from 'path';

export const createGetKeyPair = (context: any) => async (publicKey: any) => {
  // 1. If the key pair is already in the cache, return it
  if (context.keyPairs.has(publicKey))
    return result.ok(context.keyPairs.get(publicKey));

  // 2. Read the private key from the file
  const fullFilePath = path.join(context.rootDirPath, publicKey);
  const fileContent = await readFile(fullFilePath, { encoding: 'utf-8' });

  // 3. Save the key pair to the cache
  const kp = keyPair(fileContent);
  context.keyPairs.set(kp.publicKey, kp);

  return result.ok(kp);
};
