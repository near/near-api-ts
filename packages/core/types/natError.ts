import type {
  CreateKeyPairErrorVariant,
  KeyPairErrorVariant,
} from 'nat-types/_common/keyPair/keyPair';
import type { NatError } from '@common/natError';
import type {
  CreateRandomSecp256k1KeyPairErrorVariant,
  RandomSecp256k1KeyPairErrorVariant,
} from 'nat-types/_common/keyPair/randomSecp256k1KeyPair';
import type {
  CreateRandomEd25519KeyPairErrorVariant,
  RandomEd25519KeyPairErrorVariant,
} from 'nat-types/_common/keyPair/randomEd25519KeyPair';

export type UnknownErrorContext = { cause: unknown };

export type NatUnknownErrorKind = NatError<
  | 'CreateKeyPair.Unknown'
  | 'KeyPair.Sign.Unknown'
  | 'CreateRandomEd25519KeyPair.Unknown'
  | 'RandomEd25519KeyPair.Sign.Unknown'
  | 'CreateRandomSecp256k1KeyPair.Unknown'
  | 'RandomSecp256k1KeyPair.Sign.Unknown'
>['kind'];

type NatErrorVariant =
  | CreateKeyPairErrorVariant
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
