import { base58 } from '@scure/base';
import { signTransaction } from './signTransaction';

export const toEd25519String = (key: Uint8Array) =>
  `ed25519:${base58.encode(key)}`;

const parseKeySource = (keySource: any) => {
  if (keySource.privateKey) {
    // TODO validate private key?
    // ed25519 private key - //ed25519: + 32 byte seed + 32 byte public key
    const [curve, privateKey] = keySource.privateKey.split(':');

    return {
      publicKey: toEd25519String(base58.decode(privateKey).slice(32, 64)),
      u8SecretKey: base58.decode(privateKey).slice(0, 32),
      privateKey: keySource.privateKey,
    };
  }
};

const parseKeySources = (keySources: any) =>
  keySources.reduce((acc: any, keySource: any) => {
    const data = parseKeySource(keySource);
    data?.publicKey && (acc[data.publicKey] = data);
    return acc;
  }, {});



export const createMemoryKeyService = async ({ keySources }: any) => {
  const state = {
    keys: parseKeySources(keySources),
  };
  return {
    signTransaction: signTransaction(state),
  };
};
