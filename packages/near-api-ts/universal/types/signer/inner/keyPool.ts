import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { AccessKey, AllowedFunctions } from '../../_common/accessKey';
import type { AccountId, DelegationNonce, Result, TransactionNonce } from '../../_common/common';
import type { PublicKey } from '../../_common/crypto';
import type { GetAccessKeysError } from '../../client/methods/account/getAccessKeys';
import type { CreateSignerArgs } from '../createSigner';
import type { SignerContext } from '../signer';
import type { AccessTypePriority, Task } from './taskQueue';

export interface KeyPoolInnerErrorRegistry {
  'Signer.KeyPool.AccessKeys.NotLoaded': { cause: GetAccessKeysError };
  /**
   * No account key is left to sign by: `allowedAccessKeys` leaves them out, they are gas
   * keys, or the sign service doesn't hold them.
   */
  'Signer.KeyPool.Empty': {
    accessKeys: AccessKey[];
    allowedAccessKeys: PublicKey[];
  };
  /**
   * The sign service failed to say whether it holds a key of the account, or to give its
   * full public key - its own error is the `cause`.
   */
  'Signer.KeyPool.SignService.Failed': { cause: unknown };
  'Signer.KeyPool.SigningKey.NotFound': {
    poolKeys: PoolKeys;
    accessTypePriority: AccessTypePriority;
  };
}

type KeyPoolKeyBase = {
  publicKey: PublicKey;
  isLocked: boolean;
  nonce: TransactionNonce;
  // The nonce of the last delegation signed by the key - it is not the key's nonce until a relayer
  // sends the delegation, see executors/signDelegation.ts
  lastDelegationNonce?: DelegationNonce;
  lock: () => void;
  unlock: () => void;
  setNonce: (newNonce: TransactionNonce) => void;
  setLastDelegationNonce: (newNonce: DelegationNonce) => void;
};

export type PoolFullAccessKey = {
  accessType: 'FullAccess';
} & KeyPoolKeyBase;

export type PoolContractFunctionCallKey = {
  accessType: 'ContractFunctionCall';
  contractAccountId: AccountId;
  allowedFunctions: AllowedFunctions;
} & KeyPoolKeyBase;

export type PoolKey = PoolFullAccessKey | PoolContractFunctionCallKey;

export type PoolKeys = {
  fullAccess: PoolFullAccessKey[];
  contractFunctionCall: PoolContractFunctionCallKey[];
};

export type KeyPoolState = {
  poolKeys?: PoolKeys;
  poolKeysLoadingPromise?: Promise<Result<PoolKeys, GetPoolKeysError>>;
};

type GetPoolKeysError =
  | NatError<'Signer.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.KeyPool.Empty'>
  | NatError<'Signer.KeyPool.SignService.Failed'>;

export type GetPoolKeys = () => Promise<Result<PoolKeys, GetPoolKeysError>>;

export type KeyPoolContext = {
  getPoolKeys: GetPoolKeys;
};

type FindKeyForTaskError =
  | NatError<'Signer.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.KeyPool.Empty'>
  | NatError<'Signer.KeyPool.SignService.Failed'>;

export type FindKeyForTask = (
  task: Task,
) => Promise<Result<PoolKey | undefined, FindKeyForTaskError>>;

type IsKeyForTaskExistError =
  | NatError<'Signer.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.KeyPool.Empty'>
  | NatError<'Signer.KeyPool.SignService.Failed'>
  | NatError<'Signer.KeyPool.SigningKey.NotFound'>;

export type IsKeyForTaskExist = (task: Task) => Promise<Result<true, IsKeyForTaskExistError>>;

export type KeyPool = {
  findKeyForTask: FindKeyForTask;
  isKeyForTaskExist: IsKeyForTaskExist;
};

export type CreateKeyPool = (
  signerContext: SignerContext,
  createSignerArgs: CreateSignerArgs,
) => KeyPool;
