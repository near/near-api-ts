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
