import type { Base58String, Result } from 'nat-types/_common/common';
import type { NatError } from '@common/natError';
import type { $ZodError } from 'zod/v4/core';

export type Ed25519Curve = 'ed25519';
export type Secp256k1Curve = 'secp256k1';
export type Curve = Ed25519Curve | Secp256k1Curve;

export type Ed25519CurveString = `${Ed25519Curve}:${Base58String}`;
export type Secp256k1CurveString = `${Secp256k1Curve}:${Base58String}`;
export type CurveString = Ed25519CurveString | Secp256k1CurveString;

export type FromCurveStringErrorVariant = {
  kind: 'FromCurveString.InvalidStringFormat';
  context: {
    zodError: $ZodError;
  };
};

export type FromCurveStringOutput = { curve: Curve; u8Data: Uint8Array };

export type FromCurveStringError =
  NatError<'FromCurveString.InvalidStringFormat'>;

export type SafeFromCurveString = (
  value: CurveString,
) => Result<FromCurveStringOutput, FromCurveStringError>;
