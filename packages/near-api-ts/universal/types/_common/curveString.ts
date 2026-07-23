import type { Base58String } from './common';

export type Ed25519Curve = 'ed25519';
export type Secp256k1Curve = 'secp256k1';
export type MlDsa65Curve = 'ml-dsa-65';
export type Curve = Ed25519Curve | Secp256k1Curve | MlDsa65Curve;

export type Ed25519CurveString = `${Ed25519Curve}:${Base58String}`;
export type Secp256k1CurveString = `${Secp256k1Curve}:${Base58String}`;
export type MlDsa65CurveString = `${MlDsa65Curve}:${Base58String}`;
export type CurveString = Ed25519CurveString | Secp256k1CurveString | MlDsa65CurveString;
