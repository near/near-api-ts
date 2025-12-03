import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import { throwableKeyPair } from '../../helpers/keyPair/keyPair';
import type { InnerCreateMemoryKeyServiceArgs } from './createMemoryKeyService';

export const getKeyPairs = (
  args: InnerCreateMemoryKeyServiceArgs,
): KeyPairs => {
  if ('keySource' in args) {
    const keyPair = throwableKeyPair(args.keySource.privateKey.privateKey);
    return { [keyPair.publicKey]: keyPair };
  }

  return Object.fromEntries(
    args.keySources.map((keySource) => {
      const keyPair = throwableKeyPair(keySource.privateKey.privateKey);
      return [keyPair.publicKey, keyPair];
    }),
  );
};
