import type { Ed25519CurveString, Secp256k1CurveString } from './curveString';

export type Ed25519PublicKey = Ed25519CurveString;
export type Secp256k1PublicKey = Secp256k1CurveString;
export type PublicKey = Ed25519PublicKey | Secp256k1PublicKey;

export type Ed25519PrivateKey = Ed25519CurveString;
export type Secp256k1PrivateKey = Secp256k1CurveString;
export type PrivateKey = Ed25519PrivateKey | Secp256k1PrivateKey;

export type Ed25519Signature = Ed25519CurveString;
export type Secp256k1Signature = Secp256k1CurveString;
export type Signature = Ed25519Signature | Secp256k1Signature;

type NativeEd25519PublicKey = { ed25519Key: { data: Uint8Array } };
type NativeSecp256k1PublicKey = { secp256k1Key: { data: Uint8Array } };
export type NativePublicKey = NativeEd25519PublicKey | NativeSecp256k1PublicKey;

type NativeEd25519Signature = { ed25519Signature: { data: Uint8Array } };
type NativeSecp256k1Signature = { secp256k1Signature: { data: Uint8Array } };
export type NativeSignature = NativeEd25519Signature | NativeSecp256k1Signature;
