import type {
  AccountAccessKey,
  FunctionCallKey,
} from '../../_common/accountAccessKey';
import type { PublicKey } from '../../_common/crypto';
import type { AccountId, Nonce, Result } from '../../_common/common';
import type {
  AccessTypePriority,
  Task,
} from './taskQueue';
import type { NatError } from '../../../src/_common/natError';
import type { MemorySignerContext } from './memorySigner';
import type { CreateMemorySignerArgs } from './createMemorySigner';
import type { GetAccountAccessKeysError } from '../../client/methods/account/getAccountAccessKeys';

export type KeyPoolAccessKeysNotLoaded<Prefix extends string> = {
  kind: `${Prefix}.KeyPool.AccessKeys.NotLoaded`;
  context: {
    cause: GetAccountAccessKeysError;
  };
};

export type KeyPoolEmpty<Prefix extends string> = {
  kind: `${Prefix}.KeyPool.Empty`;
  context: {
    accountAccessKeys: AccountAccessKey[];
    allowedAccessKeys: PublicKey[];
  };
};

export type KeyPoolSigningKeyNotFound<Prefix extends string> = {
  kind: `${Prefix}.KeyPool.SigningKey.NotFound`;
  context: {
    poolKeys: PoolKeys;
    accessTypePriority: AccessTypePriority;
  };
};

type Prefix = 'MemorySigner';

export type KeyPoolErrorVariant =
  | KeyPoolAccessKeysNotLoaded<Prefix>
  | KeyPoolEmpty<Prefix>
  | KeyPoolSigningKeyNotFound<Prefix>;

type KeyPoolKeyBase = {
  publicKey: PublicKey;
  isLocked: boolean;
  nonce: Nonce;
  lock: () => void;
  unlock: () => void;
  setNonce: (newNonce: Nonce) => void;
};

export type PoolFullAccessKey = {
  accessType: 'FullAccess';
} & KeyPoolKeyBase;

export type PoolFunctionCallKey = {
  accessType: 'FunctionCall';
  contractAccountId: AccountId;
  allowedFunctions: FunctionCallKey['allowedFunctions'];
} & KeyPoolKeyBase;

export type PoolKey = PoolFullAccessKey | PoolFunctionCallKey;

export type PoolKeys = {
  fullAccess: PoolFullAccessKey[];
  functionCall: PoolFunctionCallKey[];
};

export type KeyPoolState = {
  poolKeys?: PoolKeys;
  poolKeysLoadingPromise?: Promise<Result<PoolKeys, GetPoolKeysError>>;
};

type GetPoolKeysError =
  | NatError<'MemorySigner.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.KeyPool.Empty'>;

export type GetPoolKeys = () => Promise<Result<PoolKeys, GetPoolKeysError>>;

export type KeyPoolContext = {
  getPoolKeys: GetPoolKeys;
};

type FindKeyForTaskError =
  | NatError<'MemorySigner.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.KeyPool.Empty'>;

export type FindKeyForTask = (
  task: Task,
) => Promise<Result<PoolKey | undefined, FindKeyForTaskError>>;

type IsKeyForTaskExistError =
  | NatError<'MemorySigner.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.KeyPool.Empty'>
  | NatError<'MemorySigner.KeyPool.SigningKey.NotFound'>;

export type IsKeyForTaskExist = (
  task: Task,
) => Promise<Result<true, IsKeyForTaskExistError>>;

export type KeyPool = {
  findKeyForTask: FindKeyForTask;
  isKeyForTaskExist: IsKeyForTaskExist;
};

export type CreateKeyPool = (
  signerContext: MemorySignerContext,
  createMemorySignerArgs: CreateMemorySignerArgs,
) => KeyPool;
