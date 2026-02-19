import type { NatError } from '@universal/src/_common/natError';
import type { ResultErr } from '@universal/types/_common/common';
import type { NearGasPublicErrorRegistry } from '@universal/types/_common/nearGas';
import type { NearTokenPublicErrorRegistry } from '@universal/types/_common/nearToken';
import type { ActionsPublicErrorRegistry } from '@universal/types/actions/actions';
import type { ClientInnerErrorRegistry, ClientPublicErrorRegistry } from '@universal/types/client/client';
import type { MemoryKeyServicePublicErrorRegistry } from '@universal/types/keyServices/memoryKeyService/memoryKeyService';
import type { MemorySignerInnerErrorRegistry, MemorySignerPublicErrorRegistry } from '@universal/types/signers/memorySigner/memorySigner';
import type { $ZodError } from 'zod/v4/core';
import type { KeyPairPublicErrorRegistry } from './_common/keyPair/keyPair';

export type InternalErrorContext = { cause: unknown };
export type InvalidSchemaErrorContext = { zodError: $ZodError };

// TODO remove
export type ArgsInvalidSchema<Prefix extends string> = {
  kind: `${Prefix}.Args.InvalidSchema`;
  context: { zodError: $ZodError };
};
// TODO remove
export type Internal<Prefix extends string> = {
  kind: `${Prefix}.Internal`;
  context: { cause: unknown };
};

// InnerError means that the error is only a part of inner library code and
// the end user will never see it
export interface NatInnerErrorRegistry
  extends ClientInnerErrorRegistry,
    MemorySignerInnerErrorRegistry {}

// PublicError means that error can be shown to the end user, e.g., it returns from the public API
export interface NatPublicErrorRegistry
  extends ClientPublicErrorRegistry,
    MemoryKeyServicePublicErrorRegistry,
    MemorySignerPublicErrorRegistry,
    ActionsPublicErrorRegistry,
    KeyPairPublicErrorRegistry,
    NearTokenPublicErrorRegistry,
    NearGasPublicErrorRegistry {}

interface NatErrorRegistry
  extends NatInnerErrorRegistry,
    NatPublicErrorRegistry {}

// type NatErrorVariant =
//   | ClientErrorVariant
//   | MemoryKeyServiceErrorVariant
//   | MemorySignerErrorVariant

export type NatInternalErrorKind = Extract<
  keyof NatErrorRegistry,
  `${string}.Internal`
>;

// TODO split on inner/public errors - we want to show only public errors in isNatError
export type NatErrorKind = keyof NatErrorRegistry;
export type ContextFor<K extends NatErrorKind> = NatErrorRegistry[K];

export type CreateNatErrorArgs<K extends NatErrorKind> = {
  kind: K;
  context: ContextFor<K>;
};

export type CreateResultNatError = <K extends NatErrorKind>(
  kind: K,
  context: ContextFor<K>,
) => ResultErr<NatError<K>>;
