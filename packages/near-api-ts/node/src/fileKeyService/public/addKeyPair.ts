import { keyPair } from '@universal/index';
import { result } from '@universal/src/_common/utils/result';
import { mkdir, writeFile } from 'fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'path';

export const createSafeAddKeyPair = (context: any) => async (args: any) => {
  const key = keyPair(args.privateKey);
  const fullFilePath = path.join(context.rootDirPath, key.publicKey);

  // 2. Write the private key to the file
  await mkdir(context.rootDirPath, { recursive: true });

  await writeFile(fullFilePath, key.privateKey, {
    encoding: 'utf-8',
    mode: 0o600, // accessible only by the owner
  });

  // 3. Make sure a file is written successfully
  const fileContent = await readFile(fullFilePath, { encoding: 'utf-8' });

  if (fileContent !== key.privateKey) {
    throw new Error('File is not written successfully');
  }

  // 4. Add the key to the cache
  context.keyPairs.set(key.publicKey, key);

  return result.ok(key);
};
