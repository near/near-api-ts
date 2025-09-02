/**
 * Binary length: 32 bytes
 */
export type CryptoHash = string;

export type BlockHash = CryptoHash;
export type BlockHeight = bigint;
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
export type Nonce = bigint;
export type AccountId = string;
export type BorshBytes = Uint8Array;

/**
 * Contract function name has limit - max 256 characters
 */
export type ContractFunctionName = string;

export type Units = bigint | string;
export type Tokens = string;

export type YoctoNear = bigint;
export type Near = string;

export type YoctoNearAmount = {
  yoctoNear: YoctoNear;
};

export type NearToken = Readonly<{
  yoctoNear: YoctoNear;
  near: Near;
  add: (value: NearOption) => NearToken;
  sub: (value: NearOption) => NearToken;
  mul: (value: NearOption) => NearToken;
  gt: (value: NearOption) => NearToken;
  lt: (value: NearOption) => NearToken;
}>;

export type NearOption = { near: Tokens } | { yoctoNear: Units };

export type Gas = bigint;
export type TeraGas = bigint;
/**
 * Maximum gas limit is 300 TeraGas
 */
export type GasLimit = {
  gas: Gas;
  teraGas: TeraGas;
};
export type GasOption = { gas: Gas } | { teraGas: TeraGas };
