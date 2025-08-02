export type BlockHash = string;
export type BlockHeight = number;
export type BlockId = BlockHash | BlockHeight;

export type Finality = 'OPTIMISTIC' | 'NEAR_FINAL' | 'FINAL';

type ByFinality = { finality?: Finality; blockId?: never };
type ByBlockId = { finality?: never; blockId?: BlockId };

export type BlockTarget = ByFinality | ByBlockId;

/**
 * Represents data encoded in hexadecimal format.
 * Can be either a raw byte array (Uint8Array) or a hexadecimal string (e.g., "deadbeef" or "0xdeadbeef").
 */
export type Hex = Uint8Array | string;
