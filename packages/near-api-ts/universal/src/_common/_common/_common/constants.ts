export const BinaryLengths = {
  Ed25519: {
    PrivateKey: 64, // SecretKey + PublicKey
    SecretKey: 32,
    PublicKey: 32,
    Signature: 64,
  },
  Secp256k1: {
    PrivateKey: 96, // SecretKey + PublicKey
    SecretKey: 32,
    PublicKey: 64,
    Signature: 65,
  },
  MlDsa65: {
    PrivateKey: 4032, // secret-only, no public component
    SecretKey: 4032,
    PublicKey: 1952,
    Signature: 3309,
  },
} as const;

/** Fractional digits between the NEAR and the yoctoNEAR units */
export const NearDecimals = 24 as const;
/** Fractional digits between the TeraGas and the gas units */
export const TeraGasDecimals = 12 as const;

export const Nep366MetaTransaction = {
  /**
   * `(1 << 30) + 366` - the delegation message tag. NEP-461 defines the tagging
   * scheme (a u32 prefix over the borsh message, `1 << 30` being the start of
   * the on-chain range), NEP-366 contributes the number that goes into it. The
   * tag prefixes the bytes that get signed, never the bytes that go on the wire.
   */
  Tag: 1073742190,
} as const;

export const Nep413Message = {
  /** 2**31 + 413 */
  Tag: 2147484061,
  NonceLength: 32,
} as const;

export const constants = {
  NearDecimals,
  TeraGasDecimals,
  Nep413Message,
  Nep366MetaTransaction,
  BinaryLengths,
};
