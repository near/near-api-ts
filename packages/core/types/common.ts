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
 * Represents data encoded in hexadecimal format.
 * Can be either a raw byte array (Uint8Array) or a hexadecimal string (e.g., "deadbeef" or "0xdeadbeef").
 */
export type Hex = Uint8Array | string;
export type Base58String = string;
export type Base64String = string;

export type Nonce = number;
export type AccountId = string;
export type BorshBytes = Uint8Array;

/**
 * Contract function name has limit - max 256 characters
 */
export type ContractFunctionName = string;

// Tokens
export type Units = bigint | string;
export type Tokens = string;

// Near Gas
export type GasInputAmount = bigint | number;
export type TeraGasInputAmount = string;

export type NearGasArgs =
  | { gas: GasInputAmount }
  | { teraGas: TeraGasInputAmount };

type Gas = bigint;
type TeraGas = string;

export type NearGas = Readonly<{
  gas: Gas;
  teraGas: TeraGas;
}>;

export type JsonLikeValue =
  | string
  | number
  | boolean
  | null
  | JsonLikeValue[]
  | { [key: string]: JsonLikeValue | undefined };

export type MaybeJsonLikeValue = JsonLikeValue | undefined;

export type Milliseconds = number;

export type Result<R, E> =
  | { result: R; error?: never }
  | { result?: never; error: E };

export type TimeoutId = ReturnType<typeof setTimeout>;
