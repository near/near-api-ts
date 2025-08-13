import type {
  KeyPair,
  KeySource,
  Context,
  CreateMemoryKeyServiceInput,
} from 'nat-types/keyServices/memoryKeyService';
import { getPublicKey } from '../../helpers/crypto/getPublicKey';

const parseKeySource = (keySource: KeySource): KeyPair => {
  if ('privateKey' in keySource) {
    return {
      publicKey: getPublicKey(keySource.privateKey),
      privateKey: keySource.privateKey,
    };
  }

  // TODO implement
  if ('seedPhrase' in keySource) {
    return {
      publicKey: 'ed25519:213',
      privateKey: 'ed25519:213',
    };
  }

  throw new Error('Unknown keySource');
};

export const parseKeySources = (
  params: CreateMemoryKeyServiceInput,
): Context['keyPairs'] => {
  if (params.keySource) {
    const keyPair = parseKeySource(params.keySource);
    return { [keyPair.publicKey]: keyPair };
  }

  if (params.keySources)
    return Object.fromEntries(
      params.keySources.map((keySource) => {
        const keyPair = parseKeySource(keySource);
        return [keyPair.publicKey, keyPair];
      }),
    );

  throw new Error(
    'Cannot create MemoryKeyService - no private keys were found',
  );
};
