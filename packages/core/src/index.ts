export { createClient } from './client/createClient/createClient';
export { testnet } from './client/presets/networks';
export { createMemoryKeyService } from './keyServices/memoryKeyService/createMemoryKeyService';
export { transfer } from './common/actions/transfer';

export {
  addEd25519FullAccessKey,
  addSecp256k1FullAccessKey,
} from './common/actions/addKey';

import { secp256k1 } from '@noble/curves/secp256k1';
import { base58 } from '@scure/base';

const fn = () => {
  const u8SecretKey = secp256k1.utils.randomSecretKey();
  // nearcore expects uncompressed public key without header 0x04
  const u8PublicKey = secp256k1.getPublicKey(u8SecretKey, false);
  const u8PublicKeyWithoutHeader = u8PublicKey.slice(1);

  const u8PrivateKey = new Uint8Array([
    ...u8SecretKey,
    ...u8PublicKeyWithoutHeader,
  ]);

  return {
    publicKey: `secp256k1:${base58.encode(u8PublicKeyWithoutHeader)}`,
    privateKey: `secp256k1:${base58.encode(u8PrivateKey)}`,
  };
};

// const res = fn();
// console.log(res);
