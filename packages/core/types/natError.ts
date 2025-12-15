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
import type {
  ClientErrorVariant,
  ClientInternalErrorKind,
} from 'nat-types/client/client';
import type {
  MemorySignerErrorVariant,
  MemorySignerInternalErrorKind,
} from 'nat-types/signers/memorySigner/memorySigner';
import type {
  CreateAddKeyActionErrorVariant,
  CreateAddKeyActionInternalErrorKind,
} from 'nat-types/actions/addKey';
import type {
  CreateTransferActionErrorVariant,
  CreateTransferActionInternalErrorKind,
} from 'nat-types/actions/transfer';
import type {
  CreateFunctionCallActionErrorVariant,
  CreateFunctionCallActionInternalErrorKind,
} from 'nat-types/actions/functionCall';

export type InternalErrorContext = { cause: unknown };
export type InvalidSchemaContext = { zodError: $ZodError };

type NatErrorVariant =
  | ClientErrorVariant
  | MemoryKeyServiceErrorVariant
  | MemorySignerErrorVariant
  | CreateTransferActionErrorVariant
  | CreateAddKeyActionErrorVariant
  | CreateFunctionCallActionErrorVariant
  | NearTokenErrorVariant
  | NearGasErrorVariant
  | KeyPairErrorVariant
  | CreateRandomEd25519KeyPairErrorVariant
  | RandomEd25519KeyPairErrorVariant
  | CreateRandomSecp256k1KeyPairErrorVariant
  | RandomSecp256k1KeyPairErrorVariant;

export type NatInternalErrorKind = NatError<
  | ClientInternalErrorKind
  | MemorySignerInternalErrorKind
  | 'CreateMemoryKeyService.Internal'
  | 'MemoryKeyService.SignTransaction.Internal'
  | 'MemoryKeyService.FindKeyPair.Internal'
  | CreateTransferActionInternalErrorKind
  | CreateAddKeyActionInternalErrorKind
  | CreateFunctionCallActionInternalErrorKind
  | 'CreateNearToken.Internal'
  | 'CreateNearTokenFromYoctoNear.Internal'
  | 'CreateNearTokenFromNear.Internal'
  | 'CreateNearGas.Internal'
  | 'CreateNearGasFromGas.Internal'
  | 'CreateNearGasFromTeraGas.Internal'
  | 'CreateKeyPair.Internal'
  | 'KeyPair.Sign.Internal'
  | 'CreateRandomEd25519KeyPair.Internal'
  | 'Ed25519KeyPair.Sign.Internal'
  | 'CreateRandomSecp256k1KeyPair.Internal'
  | 'Secp256k1KeyPair.Sign.Internal'
>['kind'];

// TODO split on inner/public errors
export type NatErrorKind = NatErrorVariant['kind'];

export type ContextFor<K extends NatErrorKind> = Extract<
  NatErrorVariant,
  { kind: K }
>['context'];

export type CreateNatErrorArgs<K extends NatErrorKind> = {
  kind: K;
  context: ContextFor<K>;
};
