import type { Ed25519PublicKey, PublicKeyId, Secp256k1PublicKey } from '../../types/_common/crypto';
import { toMlDsa65PublicKeyHash } from './_common/toMlDsa65PublicKeyHash';
import type { InnerPublicKey } from './zodSchemas/publicKey';

export const toPublicKeyId = ({ curve, publicKey, publicKeyU8 }: InnerPublicKey): PublicKeyId =>
  curve === 'ml-dsa-65'
    ? toMlDsa65PublicKeyHash(publicKeyU8)
    : (publicKey as Ed25519PublicKey | Secp256k1PublicKey);
