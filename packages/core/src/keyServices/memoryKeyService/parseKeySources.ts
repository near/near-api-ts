import type {
  KeyPair,
  KeySource,
  Context,
} from 'nat-types/keyServices/memoryKeyService';
import { getPublicKey } from '../../common/crypto/getPublicKey';

const parseKeySource = (keySource: KeySource): KeyPair => {
  if ('privateKey' in keySource) {
    return {
      publicKey: getPublicKey(keySource.privateKey),
      privateKey: keySource.privateKey,
    };
  }

  if ('seedPhrase' in keySource) {
    return {
      publicKey: 'ed25519:213',
      privateKey: 'ed25519:213',
    };
  }

  throw new Error('Unknown key source key source');
};

export const parseKeySources = (keySources: KeySource[]): Context['keyPairs'] =>
  Object.fromEntries(
    keySources.map((keySource) => {
      const keyPair = parseKeySource(keySource);
      return [keyPair.publicKey, keyPair];
    }),
  );
