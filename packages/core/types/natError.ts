import type { KeyPairErrorVariant } from 'nat-types/_common/keyPair/keyPair';
import type { NatError } from '@common/natError';
import type {
  CreateRandomSecp256k1KeyPairErrorVariant,
  RandomSecp256k1KeyPairErrorVariant,
} from 'nat-types/_common/keyPair/randomSecp256k1KeyPair';
import type {
  CreateRandomEd25519KeyPairErrorVariant,
  RandomEd25519KeyPairErrorVariant,
} from 'nat-types/_common/keyPair/randomEd25519KeyPair';
import type { MemoryKeyServiceErrorVariant } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type { $ZodError } from 'zod/v4/core';
import type { NearTokenErrorVariant } from 'nat-types/_common/nearToken';
import type { NearGasErrorVariant } from 'nat-types/_common/nearGas';

export type UnknownErrorContext = { cause: unknown };
export type InvalidArgsContext = { zodError: $ZodError };

export type NatUnknownErrorKind = NatError<
  | 'CreateMemoryKeyService.Unknown'
  | 'MemoryKeyService.SignTransaction.Unknown'
  | 'MemoryKeyService.FindKeyPair.Unknown'
  | 'CreateNearToken.Unknown'
  | 'CreateNearTokenFromYoctoNear.Unknown'
  | 'CreateNearTokenFromNear.Unknown'
  | 'CreateNearGas.Unknown'
  | 'CreateNearGasFromGas.Unknown'
  | 'CreateNearGasFromTeraGas.Unknown'
  | 'CreateKeyPair.Unknown'
  | 'KeyPair.Sign.Unknown'
  | 'CreateRandomEd25519KeyPair.Unknown'
  | 'Ed25519KeyPair.Sign.Unknown'
  | 'CreateRandomSecp256k1KeyPair.Unknown'
  | 'Secp256k1KeyPair.Sign.Unknown'
>['kind'];

// TODO split on inner/public errors
type NatErrorVariant =
  | MemoryKeyServiceErrorVariant
  | NearTokenErrorVariant
  | NearGasErrorVariant
  | KeyPairErrorVariant
  | CreateRandomEd25519KeyPairErrorVariant
  | RandomEd25519KeyPairErrorVariant
  | CreateRandomSecp256k1KeyPairErrorVariant
  | RandomSecp256k1KeyPairErrorVariant;

export type NatErrorKind = NatErrorVariant['kind'];

export type ContextFor<K extends NatErrorKind> = Extract<
  NatErrorVariant,
  { kind: K }
>['context'];

export type CreateNatErrorArgs<K extends NatErrorKind> = {
  kind: K;
  context: ContextFor<K>;
};
