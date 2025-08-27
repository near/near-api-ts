import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService';
import type { PublicKey } from 'nat-types/crypto';

export const createFindPrivateKey =
  (keyPairs: KeyPairs) => (publicKey: PublicKey) => {
    const privateKey = keyPairs[publicKey];
    if (keyPairs[publicKey]) return privateKey;
    throw new Error(
      `Cannot find a corresponding private key for '${publicKey}'`,
    );
  };
