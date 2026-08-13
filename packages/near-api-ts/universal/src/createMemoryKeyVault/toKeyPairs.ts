import type { KeyPairs } from '../../types/memoryKeyService/memoryKeyService';
import { keyPair } from '../_common/keyPairs/keyPair/keyPair';
import type { InnerCreateMemoryKeyServiceArgs } from './createMemoryKeyService';

export const toKeyPairs = (args: InnerCreateMemoryKeyServiceArgs): KeyPairs => {
  if ('keySource' in args) {
    const kp = keyPair(args.keySource.privateKey.privateKey);
    return { [kp.publicKey]: kp };
  }

  return Object.fromEntries(
    args.keySources.map((keySource) => {
      const kp = keyPair(keySource.privateKey.privateKey);
      return [kp.publicKey, kp];
    }),
  );
};
