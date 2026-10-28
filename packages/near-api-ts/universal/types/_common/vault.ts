import type { Result } from './common';
import type { PublicKey, PublicKeyId } from './crypto';
import type { SignDataArgs, SignedData } from './signData';

/**
 * A key is asked about by the key itself, or by the id an account lists it under -
 * the two differ only for an ml-dsa-65 key, which an account lists by its hash.
 */
export type HasKeyPairArgs =
  | { publicKey: PublicKey; publicKeyId?: never }
  | { publicKey?: never; publicKeyId: PublicKeyId };

export type GetPublicKeyArgs = { publicKeyId: PublicKeyId };

/**
 * What a sign service needs from a vault: whether the vault holds a key pair, the full
 * public key of a key pair it holds, found by the id an account lists the key under,
 * and a signature of raw bytes by that key.
 * How a vault stores its keys, and how they are added or removed, is up to the vault.
 */
export type Vault = {
  safeHasKeyPair: (args: HasKeyPairArgs) => Promise<Result<boolean, unknown>>;
  safeGetPublicKey: (args: GetPublicKeyArgs) => Promise<Result<PublicKey, unknown>>;
  safeSignData: (args: SignDataArgs) => Promise<Result<SignedData, unknown>>;
};
