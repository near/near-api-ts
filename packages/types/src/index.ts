export type EllipticCurve = 'ed25519' | 'secp256k1';
export type EllipticCurveString = `ed25519:${string}` | `secp256k1:${string}`;
export type PrivateKey = EllipticCurveString;
export type PublicKey = EllipticCurveString;
export type Signature = EllipticCurveString;

export type BlockHash = string;
export type BlockHeight = number;
export type BlockId = BlockHash | BlockHeight;

export type Finality = 'OPTIMISTIC' | 'NEAR_FINAL' | 'FINAL';

type ByFinality = { finality?: Finality; blockId?: never };
type ByBlockId = { finality?: never; blockId?: BlockId };

export type BlockTarget = ByFinality | ByBlockId;

export {
  PrivateKeySchema,
  EllipticCurveSchema,
  CryptoKeyLengths,
} from './schemas/PrivateKey';
