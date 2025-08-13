import type {Context} from 'nat-types/keyServices/memoryKeyService';
import type {PublicKey} from 'nat-types/crypto';

export const createFindPrivateKey =
  (keyPairs: Context['keyPairs']) => (publicKey: PublicKey) => {
    const privateKey = keyPairs[publicKey]?.privateKey;
    if (privateKey) return privateKey;
    throw new Error(
      `Cannot find a corresponding private key for '${publicKey}'`,
    );
  };
