import type { FunctionCallKey } from 'nat-types/_common/accountAccessKey';
import type { PublicKey } from 'nat-types/_common/crypto';
import type { AccountId, Nonce, Result } from 'nat-types/_common/common';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { GetAccountAccessKeysError } from 'nat-types/client/methods/account/getAccountAccessKeys';
import type { NatError } from '@common/natError';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';

export type CreateKeyPoolErrorVariant = {
  kind: 'CreateMemorySigner.CreateKeyPool.Failed';
  context: { cause: GetAccountAccessKeysError };
};

type KeyPoolKeyBase = {
  publicKey: PublicKey;
  isLocked: boolean;
  nonce: Nonce;
  lock: () => void;
  unlock: () => void;
  setNonce: (newNonce: Nonce) => void;
};

export type KeyPoolFullAccessKey = {
  accessType: 'FullAccess';
} & KeyPoolKeyBase;

export type KeyPoolFunctionCallKey = {
  accessType: 'FunctionCall';
  contractAccountId: AccountId;
  allowedFunctions: FunctionCallKey['allowedFunctions'];
} & KeyPoolKeyBase;

export type KeyPoolKey = KeyPoolFullAccessKey | KeyPoolFunctionCallKey;

export type KeyList = {
  fullAccess: KeyPoolFullAccessKey[];
  functionCall: KeyPoolFunctionCallKey[];
};

export type FindKeyForTask = (task: Task) => KeyPoolKey | undefined;
export type IsKeyForTaskExist = (task: Task) => boolean;

export type KeyPool = {
  findKeyForTask: FindKeyForTask;
  isKeyForTaskExist: IsKeyForTaskExist;
};

export type CreateKeyPoolError =
  | NatError<'CreateMemorySigner.CreateKeyPool.Failed'>
  | NatError<'CreateMemorySigner.Signer.AccessKeys.NotFound'>
  | NatError<'CreateMemorySigner.KeyPool.Empty'>;

export type CreateKeyPool = (
  signerContext: MemorySignerContext,
) => Promise<Result<KeyPool, CreateKeyPoolError>>;
