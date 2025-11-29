import type {
  KeyPairs,
  CreateMemoryKeyServiceArgs,
} from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import { throwableCreateKeyPair } from '../../helpers/keyPair/keyPair';

export const getKeyPairs = (args: CreateMemoryKeyServiceArgs): KeyPairs => {
  if (args.keySource) {
    const keyPair = throwableCreateKeyPair(args.keySource.privateKey);
    return { [keyPair.publicKey]: keyPair };
  }

  return Object.fromEntries(
    args.keySources.map((keySource) => {
      const keyPair = throwableCreateKeyPair(keySource.privateKey);
      return [keyPair.publicKey, keyPair];
    }),
  );
};
