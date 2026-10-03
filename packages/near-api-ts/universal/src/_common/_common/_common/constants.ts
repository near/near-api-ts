export const BinaryLengths = {
  Ed25519: {
    PrivateKey: 64, // SecretKey + PublicKey
    SecretKey: 32,
    PublicKey: 32,
    PublicKeyRef: 32, // the public key itself
    Signature: 64,
  },
  Secp256k1: {
    PrivateKey: 96, // SecretKey + PublicKey
    SecretKey: 32,
    PublicKey: 64,
    PublicKeyRef: 64, // the public key itself
    Signature: 65,
  },
  MlDsa65: {
    PrivateKey: 4032, // secret-only, no public component
    SecretKey: 4032,
    PublicKey: 1952,
    PublicKeyRef: 32, // SHA3-256 of the public key
    Signature: 3309,
  },
} as const;

/** Fractional digits between the NEAR and the yoctoNEAR units */
export const NearDecimals = 24 as const;
/** Fractional digits between the TeraGas and the gas units */
export const TeraGasDecimals = 12 as const;

/**
 * The tags a delegation is signed with - a u32 prefix over the borsh message, `(1 << 30) + <NEP>`.
 * The range starting at `1 << 30` is nearcore's own choice for messages verified on chain
 * (`MessageDiscriminant`, core/primitives/src/signable_message.rs), not a standard: NEP-461,
 * which was meant to specify it, never was accepted. The tag prefixes the bytes that get signed,
 * never the bytes that go on the wire, and it tells the two delegation formats apart.
 */
export const Delegation = {
  /** `(1 << 30) + 366` - NEP-366, nearcore `DelegateAction`: a key with a single nonce channel. */
  Nep366Tag: 1073742190,
  /** `(1 << 30) + 611` - NEP-611, nearcore `DelegateActionV2`: any nonce channel of a key. */
  Nep611Tag: 1073742435,
} as const;

export const Nep413Message = {
  /** 2**31 + 413 */
  Tag: 2147484061,
  NonceLength: 32,
} as const;

export const NonceChannels = {
  /**
   * The most nonce channels a key paid from its own balance (a gas key) may keep - nearcore's
   * `AccessKeyPermission::MAX_NONCES_FOR_GAS_KEY`, a protocol constant rather than a runtime config.
   */
  MaxChannelCount: 1024,
} as const;

export const constants = {
  NearDecimals,
  TeraGasDecimals,
  Nep413Message,
  Delegation,
  BinaryLengths,
  NonceChannels,
};
