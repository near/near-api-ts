/**
 * Binary length: 32 bytes
 */
export type CryptoHash = string;

export type BlockHash = CryptoHash;
export type BlockHeight = number;

export type BlockId = { blockHash: BlockHash } | { blockHeight: BlockHeight };

export type LatestBlock =
  | 'LatestOptimisticBlock'
  | 'LatestNearFinalBlock'
  | 'LatestFinalBlock';

export type SyncCheckpoint = 'EarliestAvailableBlock' | 'GenesisBlock';

export type BlockReference = LatestBlock | SyncCheckpoint | BlockId;

export type NativeBlockReference =
  | { block_id: BlockHash | BlockHeight }
  | { finality: 'optimistic' | 'near-final' | 'final' }
  | { sync_checkpoint: 'genesis' | 'earliest_available' };

/**
 * Data for signing can be either a raw byte array (Uint8Array) or a hexadecimal string
 * (e.g., "Hello world!" -> "48656c6c6f20776f726c6421").
 */
export type Hex = Uint8Array | string;
export type Base58String = string;
export type Base64String = string;

export type Nonce = number;
export type AccountId = string;
export type BorshBytes = Uint8Array;

/**
 * Contract function name has max 256 characters
 */
export type ContractFunctionName = string;

/**
 * Smallest part of cryptocurrency token, used for math operations, f.e
 * 1 yoctoNear or 1 satoshi
 */
export type Units = bigint | string;
/**
 * Human-readable token amount, f.e 1 NEAR or 1 Bitcoin
 */
export type Tokens = string;

export type JsonLikeValue =
  | string
  | number
  | boolean
  | null
  | JsonLikeValue[]
  | { [key: string]: JsonLikeValue | undefined };

export type MaybeJsonLikeValue = JsonLikeValue | undefined;

export type Milliseconds = number;
export type TimeoutId = ReturnType<typeof setTimeout>;

export type ResultOk<V> = { ok: true; value: V };
export type ResultErr<E> = { ok: false; error: E };
export type Result<V, E> = ResultOk<V> | ResultErr<E>;
