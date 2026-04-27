import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../common';
import type { Secp256k1PrivateKey, Secp256k1PublicKey, Secp256k1Signature } from '../crypto';
import type { Secp256k1Curve } from '../curveString';
import type { KeyPairSignDataArgs } from './_common';

// *********** SignData *****
export type SignedDataSecp256k1 = {
  dataU8: Uint8Array;
  curve: Secp256k1Curve;
  signature: Secp256k1Signature;
  signatureU8: Uint8Array;
};

type Secp256k1SignDataError =
  | NatError<'Secp256k1KeyPair.SignData.Args.InvalidSchema'>
  | NatError<'Secp256k1KeyPair.SignData.Internal'>;

export type SafeSignData = (
  args: KeyPairSignDataArgs,
) => Promise<Result<SignedDataSecp256k1, Secp256k1SignDataError>>;

type SignData = (args: KeyPairSignDataArgs) => Promise<SignedDataSecp256k1>;
// ***********  CreateRandomSecp256k1KeyPair *****

type CreateRandomSecp256k1Error = NatError<'CreateRandomSecp256k1KeyPair.Internal'>;

export type Secp256k1KeyPair = {
  curve: 'secp256k1';
  publicKey: Secp256k1PublicKey;
  publicKeyU8: Uint8Array;
  privateKey: Secp256k1PrivateKey;
  privateKeyU8: Uint8Array;
  signData: SignData;
  safeSignData: SafeSignData;
};

export type SafeCreateRandomSecp256k1KeyPair = () => Result<
  Secp256k1KeyPair,
  CreateRandomSecp256k1Error
>;

export type CreateRandomSecp256k1KeyPair = () => Secp256k1KeyPair;
