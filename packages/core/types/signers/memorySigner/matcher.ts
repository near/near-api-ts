import type {
  SigningKeyPriority,
  Task,
} from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { Result } from 'nat-types/_common/common';
import type { NatError } from '@common/natError';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';

export type MatcherErrorVariant = {
  kind: 'MemorySigner.Matcher.NoKeysForTaskFound';
  context: {
    signingKeyPriority: SigningKeyPriority;
  };
};

export type CanHandleTaskInFuture = (
  task: Task,
) => Result<true, NatError<'MemorySigner.Matcher.NoKeysForTaskFound'>>;

export type Matcher = {
  handleAddTask: (task: Task) => Promise<void>;
  handleKeyUnlock: (key: KeyPoolKey) => Promise<void>;
  canHandleTaskInFuture: CanHandleTaskInFuture;
};

export type CreateMatcher = (context: MemorySignerContext) => Matcher;
