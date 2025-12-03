import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import { throwableKeyPair } from '../../helpers/keyPair/keyPair';
import type { CreateMemoryKeyServiceArgs } from 'nat-types/keyServices/memoryKeyService/createMemoryKeyService';

export const getKeyPairs = (args: CreateMemoryKeyServiceArgs): KeyPairs => {
  if (args.keySource) {
    const keyPair = throwableKeyPair(args.keySource.privateKey);
    return { [keyPair.publicKey]: keyPair };
  }

  return Object.fromEntries(
    args.keySources.map((keySource) => {
      const keyPair = throwableKeyPair(keySource.privateKey);
      return [keyPair.publicKey, keyPair];
    }),
  );
};
