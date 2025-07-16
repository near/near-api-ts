// Example: 'GkBD5hUvXN8Xf4ujYusZLpLoNn3zfkhZoq67bjWaRVaX'
export type BlockHash = string;
// Example: 178317729
export type BlockHeight = number;

export type BlockId = BlockHash | BlockHeight;

export enum Finality {
  OPTIMISTIC = 'OPTIMISTIC',
  NEAR_FINAL = 'NEAR_FINAL',
  FINAL = 'FINAL',
}
