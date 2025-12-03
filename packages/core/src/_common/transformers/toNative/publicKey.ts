import type { NativePublicKey } from 'nat-types/_common/crypto';
import type { InnerPublicKey } from '@common/schemas/zod/common/publicKey';

export const toNativePublicKey = ({
  u8PublicKey,
  curve,
}: InnerPublicKey): NativePublicKey =>
  curve === 'ed25519'
    ? { ed25519Key: { data: u8PublicKey } }
    : { secp256k1Key: { data: u8PublicKey } };
