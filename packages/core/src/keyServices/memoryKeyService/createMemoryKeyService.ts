import { signTransaction } from './signTransaction';
import { getPublicKey } from '../../common/crypto/getPublicKey';
import type { PrivateKey, PublicKey } from '@types';

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
  keySources.reduce(
    (acc: Record<PublicKey, ParseKeySourceResult>, keySource) => {
      const data = parseKeySource(keySource);
      acc[data.publicKey] = data;
      return acc;
    },
    {},
  );

type CreateMemoryKeyServiceArgs = {
  keySources: KeySource[];
};

export const createMemoryKeyService = async ({
  keySources,
}: CreateMemoryKeyServiceArgs) => {
  const state = {
    keys: parseKeySources(keySources),
  };
  return {
    signTransaction: signTransaction(state),
  };
};
