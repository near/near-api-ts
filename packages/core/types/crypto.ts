import type { Base58String } from './common';

export type Ed25519Curve = 'ed25519';
export type Secp256k1Curve = 'secp256k1';
export type Curve = Ed25519Curve | Secp256k1Curve;

export type Ed25519CurveString = `${Ed25519Curve}:${Base58String}`;
export type Secp256k1CurveString = `${Secp256k1Curve}:${Base58String}`;
export type CurveString = Ed25519CurveString | Secp256k1CurveString;

export type Ed25519PublicKey = Ed25519CurveString;
export type Secp256k1PublicKey = Secp256k1CurveString;
export type PublicKey = Ed25519PublicKey | Secp256k1PublicKey;

export type PrivateKey = CurveString;
export type Signature = CurveString;

type NativeEd25519PublicKey = {
  ed25519Key: { data: Uint8Array };
};

type NativeSecp256k1PublicKey = {
  secp256k1Key: { data: Uint8Array };
};

export type NativePublicKey = NativeEd25519PublicKey | NativeSecp256k1PublicKey;

type NativeEd25519Signature = {
  ed25519Signature: { data: Uint8Array };
};

type NativeSecp256k1Signature = {
  secp256k1Signature: { data: Uint8Array };
};

export type NativeSignature = NativeEd25519Signature | NativeSecp256k1Signature;
