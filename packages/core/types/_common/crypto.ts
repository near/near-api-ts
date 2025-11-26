import type { Curve, CurveString } from 'nat-types/_common/curveString';

export type PublicKey = CurveString;

export type PrivateKey = CurveString;
export type U8PrivateKey = { curve: Curve; u8PrivateKey: Uint8Array };

export type Signature = CurveString;
export type U8Signature = { curve: Curve; u8Signature: Uint8Array };

type NativeEd25519PublicKey = { ed25519Key: { data: Uint8Array } };
type NativeSecp256k1PublicKey = { secp256k1Key: { data: Uint8Array } };
export type NativePublicKey = NativeEd25519PublicKey | NativeSecp256k1PublicKey;

type NativeEd25519Signature = { ed25519Signature: { data: Uint8Array } };
type NativeSecp256k1Signature = { secp256k1Signature: { data: Uint8Array } };
export type NativeSignature = NativeEd25519Signature | NativeSecp256k1Signature;
