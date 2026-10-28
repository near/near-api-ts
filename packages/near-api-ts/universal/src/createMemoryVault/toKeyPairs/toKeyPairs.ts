import type { KeyPairs } from '../../../types/memoryVault/memoryVault';
import type { InnerCreateMemoryVaultArgs } from '../createMemoryVault';
import { keyPair } from './keyPairs/keyPair/keyPair';

export const toKeyPairs = (args: InnerCreateMemoryVaultArgs): KeyPairs => {
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
