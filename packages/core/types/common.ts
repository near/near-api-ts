/**
 * Binary length: 32 bytes
 */
export type CryptoHash = string;

export type BlockHash = CryptoHash;
export type BlockHeight = number;
export type BlockId = BlockHash | BlockHeight;

export type Finality = 'Optimistic' | 'NearFinal' | 'Final';
export type SyncCheckpoint = 'Genesis' | 'EarliestAvailable';

export type BlockReference =
  | { finality: Finality }
  | { blockId: BlockId }
  | { syncCheckpoint: SyncCheckpoint };

/**
 * Represents data encoded in hexadecimal format.
 * Can be either a raw byte array (Uint8Array) or a hexadecimal string (e.g., "deadbeef" or "0xdeadbeef").
 */
export type Hex = Uint8Array | string;
export type Base58String = string;
export type Base64String = string;

// Rust type: u64
export type Nonce = number;
export type AccountId = string;
export type BorshBytes = Uint8Array;

/**
 * Contract function name has limit - max 256 characters
 */
export type ContractFunctionName = string;

export type YoctoNear = bigint;
export type Near = string;

export type NearToken = Readonly<{
  yoctoNear: YoctoNear;
  near: Near;
  add: (value: NearOption) => NearToken;
  sub: (value: NearOption) => NearToken;
  mul: (value: NearOption) => NearToken;
  gt: (value: NearOption) => NearToken;
  lt: (value: NearOption) => NearToken;
}>;

export type Units = bigint | string;
export type Tokens = string;
export type NearOption = { near: Tokens } | { yoctoNear: Units };

// TODO rename to better names
export type GasInput = bigint | number;
export type TeraGasInput = string;
export type GasOption = { gas: GasInput } | { teraGas: TeraGasInput };

type Gas = bigint;
type TeraGas = string;

export type GasLimit = Readonly<{
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
