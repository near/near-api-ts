import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { AllowedFunctions } from '../../_common/accessKey';
import type { AccountId, Result, TransactionNonce } from '../../_common/common';
import type { PublicKey } from '../../_common/crypto';
import type { SignerErrorContext } from '../_common/errorContext';
import type { CreateSignerArgs } from '../createSigner';
import type { SignerContext } from '../signer';
import type { Task } from './taskQueue';

export interface KeyPoolInnerErrorRegistry {
  'Signer.KeyPool.AccessKeys.NotLoaded': SignerErrorContext['KeyPool']['AccessKeys']['NotLoaded'];
  'Signer.KeyPool.Empty': SignerErrorContext['KeyPool']['Empty'];
  'Signer.KeyPool.SigningKey.NotFound': SignerErrorContext['KeyPool']['SigningKey']['NotFound'];
}

type KeyPoolKeyBase = {
  publicKey: PublicKey;
  isLocked: boolean;
  nonce: TransactionNonce;
  lock: () => void;
  unlock: () => void;
  setNonce: (newNonce: TransactionNonce) => void;
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
  | NatError<'Signer.KeyPool.Empty'>;

export type GetPoolKeys = () => Promise<Result<PoolKeys, GetPoolKeysError>>;

export type KeyPoolContext = {
  getPoolKeys: GetPoolKeys;
};

type FindKeyForTaskError =
  | NatError<'Signer.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.KeyPool.Empty'>;

export type FindKeyForTask = (
  task: Task,
) => Promise<Result<PoolKey | undefined, FindKeyForTaskError>>;

type IsKeyForTaskExistError =
  | NatError<'Signer.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.KeyPool.Empty'>
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
