import { getPublicKey } from '../../helpers/crypto/getPublicKey';
import type {
  KeyPairs,
  KeySource,
  CreateMemoryKeyServiceInput,
} from 'nat-types/keyServices/memoryKeyService';
import type { PrivateKey, PublicKey } from 'nat-types/crypto';

const parseKeySource = (
  keySource: KeySource,
): { publicKey: PublicKey; privateKey: PrivateKey } => {
  if ('privateKey' in keySource) {
    return {
      publicKey: getPublicKey(keySource.privateKey),
      privateKey: keySource.privateKey,
    };
  }

  // TODO implement
  if ('seedPhrase' in keySource) {
    throw new Error('Unimplemented!');
  }

  throw new Error('Unknown keySource');
};

export const parseKeySources = (
  params: CreateMemoryKeyServiceInput,
): KeyPairs => {
  if (params.keySource) {
    const { publicKey, privateKey } = parseKeySource(params.keySource);
    return { [publicKey]: privateKey };
  }

  if (params.keySources)
    return Object.fromEntries(
      params.keySources.map((keySource) => {
        const { publicKey, privateKey } = parseKeySource(keySource);
        return [publicKey, privateKey];
      }),
    );

  throw new Error(
    'Cannot create MemoryKeyService - no private keys were found',
  );
};
