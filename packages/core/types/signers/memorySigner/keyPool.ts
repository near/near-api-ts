import type { FunctionCallKey } from 'nat-types/_common/accountKey';
import type { PrivateKey, PublicKey } from 'nat-types/_common/crypto';
import type { AccountId, Nonce } from 'nat-types/_common/common';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';

type KeyPoolKeyBase = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
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
