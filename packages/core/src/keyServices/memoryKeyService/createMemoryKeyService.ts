import { signTransaction } from './signTransaction';
import { getPublicKey } from '../../common/crypto/getPublicKey';
import type { PrivateKey, PublicKey } from 'nat-types/crypto';
import type { KeyPair } from 'nat-types/keyServices/memoryKeyService';

type KeySource = { privateKey: PrivateKey };

type ParseKeySourceResult = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
};

const parseKeySource = (keySource: KeySource): ParseKeySourceResult => {
  // if (keySource.privateKey) {
  return {
    publicKey: getPublicKey(keySource.privateKey),
    privateKey: keySource.privateKey,
  };
  // }
};

const parseKeySources = (keySources: KeySource[]) =>
  Object.fromEntries(
    keySources.map((keySource) => {
      const keyPair = parseKeySource(keySource);
      return [keyPair.publicKey, keyPair];
    }),
  );

// keySources.reduce(
//   (acc: Record<PublicKey, ParseKeySourceResult>, keySource) => {
//     const data = parseKeySource(keySource);
//     acc[data.publicKey] = data;
//     return acc;
//   },
//   {},
// );

type InputArgs = {
  keySources: KeySource[];
};

export const createMemoryKeyService = async ({ keySources }: InputArgs) => {
  const context = {
    keys: parseKeySources(keySources),
  };
  return {
    signTransaction: signTransaction(context),
  };
};
