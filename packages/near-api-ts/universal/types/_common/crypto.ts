import type { Base58String } from './common';
import type { Ed25519CurveString, MlDsa65CurveString, Secp256k1CurveString } from './curveString';

export type Ed25519PublicKey = Ed25519CurveString;
export type Secp256k1PublicKey = Secp256k1CurveString;
export type MlDsa65PublicKey = MlDsa65CurveString;
export type PublicKey = Ed25519PublicKey | Secp256k1PublicKey | MlDsa65PublicKey;

/**
 * SHA3-256 of an ml-dsa-65 public key, which is how the protocol stores an ml-dsa-65
 * access key: the full 1952-byte key only travels in transactions and actions.
 */
export type MlDsa65PublicKeyHash = `ml-dsa-65-hash:${Base58String}`;

/**
 * How the protocol refers to an access key of an account. An ed25519 or secp256k1 key is
 * referred to by the public key itself, an ml-dsa-65 key — by {@link MlDsa65PublicKeyHash}.
 *
 * A ref cannot verify a signature, and the protocol does not accept it where a public key
 * is expected. Corresponds to nearcore `PublicKeyHandle`.
 */
export type PublicKeyRef = Ed25519PublicKey | Secp256k1PublicKey | MlDsa65PublicKeyHash;

export type Ed25519PrivateKey = Ed25519CurveString;
export type Secp256k1PrivateKey = Secp256k1CurveString;
export type MlDsa65PrivateKey = MlDsa65CurveString;
export type PrivateKey = Ed25519PrivateKey | Secp256k1PrivateKey | MlDsa65PrivateKey;

export type Ed25519Signature = Ed25519CurveString;
export type Secp256k1Signature = Secp256k1CurveString;
export type MlDsa65Signature = MlDsa65CurveString;
export type Signature = Ed25519Signature | Secp256k1Signature | MlDsa65Signature;

type NearcoreEd25519PublicKey = { ed25519Key: { data: Uint8Array } };
type NearcoreSecp256k1PublicKey = { secp256k1Key: { data: Uint8Array } };
type NearcoreMlDsa65PublicKey = { mlDsa65Key: { data: Uint8Array } };
export type NearcorePublicKey =
  | NearcoreEd25519PublicKey
  | NearcoreSecp256k1PublicKey
  | NearcoreMlDsa65PublicKey;

type NearcoreEd25519Signature = { ed25519Signature: { data: Uint8Array } };
type NearcoreSecp256k1Signature = { secp256k1Signature: { data: Uint8Array } };
type NearcoreMlDsa65Signature = { mlDsa65Signature: { data: Uint8Array } };
export type NearcoreSignature =
  | NearcoreEd25519Signature
  | NearcoreSecp256k1Signature
  | NearcoreMlDsa65Signature;
