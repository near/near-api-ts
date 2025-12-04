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

// Fetch block every 1000 blocks * 600ms best block time = >10 minutes
export const RefetchBlockHashInterval = 600_000;

// 1 minute
export const SignerTaskTtlMs = 60_000 as const;
