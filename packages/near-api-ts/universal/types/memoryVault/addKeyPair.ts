import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PrivateKey, PublicKey, PublicKeyId } from '../_common/crypto';

export type AddKeyPairArgs = { privateKey: PrivateKey };

/**
 * The key the vault holds now. `publicKeyId` is the id an account lists the key under -
 * it differs from `publicKey` only for an ml-dsa-65 key.
 */
export type AddKeyPairOutput = {
  publicKey: PublicKey;
  publicKeyId: PublicKeyId;
};

type AddKeyPairError =
  | NatError<'MemoryVault.AddKeyPair.Args.InvalidSchema'>
  | NatError<'MemoryVault.AddKeyPair.Internal'>;

export type SafeAddKeyPair = (
  args: AddKeyPairArgs,
) => Promise<Result<AddKeyPairOutput, AddKeyPairError>>;

export type AddKeyPair = (args: AddKeyPairArgs) => Promise<AddKeyPairOutput>;
