import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';

export type Matcher = {
  handleAddTask: (task: Task) => Promise<void>;
  handleKeyUnlock: (key: KeyPoolKey) => Promise<void>;
  canHandleTaskInFuture: (task: Task) => void;
};
