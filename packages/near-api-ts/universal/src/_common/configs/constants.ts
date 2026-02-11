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
} as const;

export const NearDecimals = 24;
