import type { NatError } from '@universal/src/_common/natError';
import type { MemorySignerErrorContext } from '@universal/types/signers/memorySigner/_common/errorContext';
import type { FunctionCallKey } from '../../../_common/accountAccessKey';
import type { AccountId, Nonce, Result } from '../../../_common/common';
import type { PublicKey } from '../../../_common/crypto';
import type { MemorySignerContext } from '../memorySigner';
import type { CreateMemorySignerArgs } from '../public/createMemorySigner';
import type { Task } from './taskQueue';

export interface KeyPoolInnerErrorRegistry {
  'MemorySigner.KeyPool.AccessKeys.NotLoaded': MemorySignerErrorContext['KeyPool']['AccessKeys']['NotLoaded'];
  'MemorySigner.KeyPool.Empty': MemorySignerErrorContext['KeyPool']['Empty'];
  'MemorySigner.KeyPool.SigningKey.NotFound': MemorySignerErrorContext['KeyPool']['SigningKey']['NotFound'];
}

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
