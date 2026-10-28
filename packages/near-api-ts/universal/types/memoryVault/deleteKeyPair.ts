import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PublicKey, PublicKeyId } from '../_common/crypto';

/**
 * A key pair is deleted by its public key, or by the id an account lists the key under -
 * the two differ only for an ml-dsa-65 key, which an account lists by its hash.
 */
export type DeleteKeyPairArgs =
  | { publicKey: PublicKey; publicKeyId?: never }
  | { publicKey?: never; publicKeyId: PublicKeyId };

type DeleteKeyPairError =
  | NatError<'MemoryVault.DeleteKeyPair.Args.InvalidSchema'>
  | NatError<'MemoryVault.DeleteKeyPair.Internal'>;

// Deleting a key pair the vault doesn't hold is not an error - the vault doesn't hold it either way
export type SafeDeleteKeyPair = (
  args: DeleteKeyPairArgs,
) => Promise<Result<undefined, DeleteKeyPairError>>;

export type DeleteKeyPair = (args: DeleteKeyPairArgs) => Promise<void>;
