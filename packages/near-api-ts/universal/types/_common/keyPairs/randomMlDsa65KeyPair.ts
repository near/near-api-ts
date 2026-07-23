import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../common';
import type { MlDsa65PrivateKey, MlDsa65PublicKey, MlDsa65Signature } from '../crypto';
import type { MlDsa65Curve } from '../curveString';
import type { KeyPairSignDataArgs } from './_common';

// *********** SignData *****
export type MlDsa65SignedData = {
  dataU8: Uint8Array;
  curve: MlDsa65Curve;
  signature: MlDsa65Signature;
  signatureU8: Uint8Array;
};

type MlDsa65SignDataError =
  | NatError<'MlDsa65KeyPair.SignData.Args.InvalidSchema'>
  | NatError<'MlDsa65KeyPair.SignData.Internal'>;

export type SafeSignData = (
  args: KeyPairSignDataArgs,
) => Promise<Result<MlDsa65SignedData, MlDsa65SignDataError>>;

type SignData = (args: KeyPairSignDataArgs) => Promise<MlDsa65SignedData>;

// ***********  CreateRandomMlDsa65KeyPair *****

type CreateRandomMlDsa65Error = NatError<'CreateRandomMlDsa65KeyPair.Internal'>;

export type MlDsa65KeyPair = {
  curve: 'ml-dsa-65';
  publicKey: MlDsa65PublicKey;
  publicKeyU8: Uint8Array;
  privateKey: MlDsa65PrivateKey;
  privateKeyU8: Uint8Array;
  signData: SignData;
  safeSignData: SafeSignData;
};

export type SafeCreateRandomMlDsa65KeyPair = () => Result<MlDsa65KeyPair, CreateRandomMlDsa65Error>;

export type CreateRandomMlDsa65KeyPair = () => MlDsa65KeyPair;
