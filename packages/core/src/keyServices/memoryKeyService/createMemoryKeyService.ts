import { ed25519 } from '@noble/curves/ed25519';
import { base58 } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2';
import { toBorshedTransaction } from './toBorshedTransaction';

export const toEd25519String = (key: Uint8Array) =>
  `ed25519:${base58.encode(key)}`;

const parseKeySource = (keySource: any) => {
  if (keySource.privateKey) {
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

const signTransaction = (state: any) => async (transaction: any) => {
  const borshedTransaction = toBorshedTransaction(transaction);
  const u8TransactionHash = sha256(borshedTransaction);

  const u8Signature = ed25519.sign(
    u8TransactionHash,
    state.keys[transaction.signerPublicKey].u8SecretKey,
  );

  return {
    ...transaction,
    transactionHash: base58.encode(u8TransactionHash),
    signature: `ed25519:${base58.encode(u8Signature)}`,
  };
};

export const createMemoryKeyService = async ({ keySources }: any) => {
  const state = {
    keys: parseKeySources(keySources),
  };
  return {
    signTransaction: signTransaction(state),
  };
};
