import type { NearcorePublicKey, PublicKey } from '../../../../../../types/_common/crypto';
import {
  toEd25519CurveString,
  toMlDsa65CurveString,
  toSecp256k1CurveString,
} from '../../../../../_common/toCurveString';

// Borsh deserializes fixed `u8` arrays into plain number arrays, not Uint8Array.
export const fromNearcorePublicKey = (publicKey: NearcorePublicKey): PublicKey => {
  if ('ed25519Key' in publicKey)
    return toEd25519CurveString(Uint8Array.from(publicKey.ed25519Key.data));

  if ('secp256k1Key' in publicKey)
    return toSecp256k1CurveString(Uint8Array.from(publicKey.secp256k1Key.data));

  if ('mlDsa65Key' in publicKey)
    return toMlDsa65CurveString(Uint8Array.from(publicKey.mlDsa65Key.data));

  throw new Error(`Unsupported public key type: ${publicKey}`);
};
