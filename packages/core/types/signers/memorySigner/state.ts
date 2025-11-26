import type { BlockHash } from 'nat-types/_common/common';

export type State = {
  getBlockHash: () => BlockHash;
  clearIntervals: () => void;
};
