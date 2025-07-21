export type BlockHash = string;
export type BlockHeight = number;
export type BlockId = BlockHash | BlockHeight;

export type Finality = 'OPTIMISTIC' | 'NEAR_FINAL' | 'FINAL';

type ByFinality = { finality?: Finality; blockId?: never };
type ByBlockId = { finality?: never; blockId?: BlockId };

export type BlockTarget = ByFinality | ByBlockId;
