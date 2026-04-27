import type { KeyPairs } from '../../../../types/keyServices/memoryKeyService/memoryKeyService';
import { keyPair } from '../../../helpers/keyPairs/keyPair/keyPair';
import type { InnerCreateMemoryKeyServiceArgs } from '../memoryKeyService';

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
