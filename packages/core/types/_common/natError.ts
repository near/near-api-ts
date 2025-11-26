import type { FromCurveStringErrorVariant } from 'nat-types/_common/curveString';
import type {
  CreateKeyPairErrorVariant,
  KeyPairErrorVariant,
} from 'nat-types/_common/keyPair';
import type { NatError } from '@common/natError';

export type UnknownErrorContext = { cause: unknown };

export type NatUnknownErrorKind = NatError<
  'CreateKeyPair.Unknown' | 'KeyPair.Sign.Unknown'
>['kind'];

type NatErrorVariant =
  | FromCurveStringErrorVariant
  | CreateKeyPairErrorVariant
  | KeyPairErrorVariant;

export type NatErrorKind = NatErrorVariant['kind'];

export type ContextFor<K extends NatErrorKind> = Extract<
  NatErrorVariant,
  { kind: K }
>['context'];

export type CreateNatErrorArgs<K extends NatErrorKind> = {
  kind: K;
  context: ContextFor<K>;
};
