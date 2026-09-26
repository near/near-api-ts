import { sha3_256 } from '@noble/hashes/sha3.js';
import { base58 } from '@scure/base';
import type { MlDsa65PublicKeyHash } from '../../../types/_common/crypto';

// nearcore HashDomainTag::MlDsa65PubkeyV1
const DomainTagU8 = new TextEncoder().encode('near:ml-dsa-65-pubkey-hash:v1');

// The form an ml-dsa-65 access key takes on chain: SHA3-256 of the domain tag followed
// by the raw public key (nearcore MlDsa65PublicKey::to_public_key_handle)
export const toMlDsa65PublicKeyHash = (publicKeyU8: Uint8Array): MlDsa65PublicKeyHash =>
  `ml-dsa-65-hash:${base58.encode(sha3_256.create().update(DomainTagU8).update(publicKeyU8).digest())}`;
