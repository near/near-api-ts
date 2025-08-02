export type Ed25519Curve = 'ed25519';
export type Secp256k1Curve = 'secp256k1';
export type Curve = Ed25519Curve | Secp256k1Curve;

export type Ed25519CurveString = `${Ed25519Curve}:${string}`;
export type Secp256k1CurveString = `${Secp256k1Curve}:${string}`;
export type CurveString = Ed25519CurveString | Secp256k1CurveString;

export type PrivateKey = CurveString;
export type PublicKey = CurveString;
export type Signature = CurveString;
