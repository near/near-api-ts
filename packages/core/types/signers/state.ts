import type { BlockHash } from 'nat-types/common';

export type State = {
  getBlockHash: () => BlockHash;
  clearIntervals: () => void;
};
