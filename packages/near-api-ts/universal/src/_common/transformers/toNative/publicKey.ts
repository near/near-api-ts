import type { NativePublicKey } from '../../../../types/_common/crypto';
import type { InnerPublicKey } from '../../schemas/zod/common/publicKey';

export const toNativePublicKey = ({ publicKeyU8, curve }: InnerPublicKey): NativePublicKey =>
  curve === 'ed25519'
    ? { ed25519Key: { data: publicKeyU8 } }
    : { secp256k1Key: { data: publicKeyU8 } };
