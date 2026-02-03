import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { PoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';

export type Matcher = {
  handleAddTask: (task: Task) => Promise<void>;
  handleKeyUnlock: (key: PoolKey) => Promise<void>;
};

export type CreateMatcher = (context: MemorySignerContext) => Matcher;
