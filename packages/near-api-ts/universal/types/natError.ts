import type { KeyPairErrorVariant } from './_common/keyPair/keyPair';
import type { NatError } from '../src/_common/natError';
import type {
  CreateRandomSecp256k1KeyPairErrorVariant,
  RandomSecp256k1KeyPairErrorVariant,
} from './_common/keyPair/randomSecp256k1KeyPair';
import type {
  CreateRandomEd25519KeyPairErrorVariant,
  RandomEd25519KeyPairErrorVariant,
} from './_common/keyPair/randomEd25519KeyPair';
import type { MemoryKeyServiceErrorVariant } from './keyServices/memoryKeyService/memoryKeyService';
import type { $ZodError } from 'zod/v4/core';
import type { NearTokenErrorVariant } from './_common/nearToken';
import type { NearGasErrorVariant } from './_common/nearGas';
import type {
  ClientErrorVariant,
  ClientInternalErrorKind,
} from './client/client';
import type {
  MemorySignerErrorVariant,
  MemorySignerInternalErrorKind,
} from './signers/memorySigner/memorySigner';
import type {
  CreateAddKeyActionErrorVariant,
  CreateAddKeyActionInternalErrorKind,
} from './actions/addKey';
import type {
  CreateTransferActionErrorVariant,
  CreateTransferActionInternalErrorKind,
} from './actions/transfer';
import type {
  CreateFunctionCallActionErrorVariant,
  CreateFunctionCallActionInternalErrorKind,
} from './actions/functionCall';
import type {
  CreateDeleteAccountActionErrorVariant,
  CreateDeleteAccountActionInternalErrorKind,
} from './actions/deleteAccount';
import type {
  CreateDeleteKeyActionErrorVariant,
  CreateDeleteKeyActionInternalErrorKind,
} from './actions/deleteKey';
import type {
  CreateDeployContractActionErrorVariant,
  CreateDeployContractActionInternalErrorKind,
} from './actions/deployContract';
import type {
  CreateStakeActionErrorVariant,
  CreateStakeActionInternalErrorKind,
} from './actions/stake';
import type {
  FileKeyServiceErrorVariant,
  FileKeyServiceInternalErrorKind,
} from '../../node/types/fileKeyService/fileKeyService';

export type InternalErrorContext = { cause: unknown };
export type InvalidSchemaContext = { zodError: $ZodError };

export type ArgsInvalidSchema<Prefix extends string> = {
  kind: `${Prefix}.Args.InvalidSchema`;
  context: { zodError: $ZodError };
};

export type Internal<Prefix extends string> = {
  kind: `${Prefix}.Internal`;
  context: { cause: unknown };
};

type NatErrorVariant =
  | ClientErrorVariant
  | MemoryKeyServiceErrorVariant
  | FileKeyServiceErrorVariant
  | MemorySignerErrorVariant
  | CreateTransferActionErrorVariant
  | CreateAddKeyActionErrorVariant
  | CreateFunctionCallActionErrorVariant
  | CreateDeployContractActionErrorVariant
  | CreateStakeActionErrorVariant
  | CreateDeleteKeyActionErrorVariant
  | CreateDeleteAccountActionErrorVariant
  | NearTokenErrorVariant
  | NearGasErrorVariant
  | KeyPairErrorVariant
  | CreateRandomEd25519KeyPairErrorVariant
  | RandomEd25519KeyPairErrorVariant
  | CreateRandomSecp256k1KeyPairErrorVariant
  | RandomSecp256k1KeyPairErrorVariant;

export type NatInternalErrorKind = NatError<
  | ClientInternalErrorKind
  | 'CreateMemoryKeyService.Internal'
  | 'MemoryKeyService.SignTransaction.Internal'
  | 'MemoryKeyService.FindKeyPair.Internal'
  | FileKeyServiceInternalErrorKind
  | MemorySignerInternalErrorKind
  | CreateTransferActionInternalErrorKind
  | CreateAddKeyActionInternalErrorKind
  | CreateFunctionCallActionInternalErrorKind
  | CreateDeployContractActionInternalErrorKind
  | CreateStakeActionInternalErrorKind
  | CreateDeleteKeyActionInternalErrorKind
  | CreateDeleteAccountActionInternalErrorKind
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
