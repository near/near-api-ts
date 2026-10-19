import type { KeyPairs } from '../../../types/memoryKeyVault/memoryKeyVault';
import type { InnerCreateMemoryKeyVaultArgs } from '../createMemoryKeyVault';
import { keyPair } from './keyPairs/keyPair/keyPair';

export const toKeyPairs = (args: InnerCreateMemoryKeyVaultArgs): KeyPairs => {
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
