export const BinaryCryptoKeyLengths = {
  Ed25519: {
    // SecretKey + PublicKey
    PrivateKey: 64,
    SecretKey: 32,
    PublicKey: 32,
  },
  Secp256k1: {
    // SecretKey + PublicKey
    PrivateKey: 96,
    SecretKey: 32,
    PublicKey: 64,
  },
} as const;

export const BinaryCryptoHashLength = 32;
export const NearDecimals = 24;

// Fetch block every 1000 blocks * 600ms best block time = >10 minutes
export const RefetchBlockHashInterval = 600 * 1000;
