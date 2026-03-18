import type { NatError } from '../../src/_common/natError';
import type { ResultErr } from './common';
import type { NearGasPublicErrorRegistry } from './nearGas';
import type { NearTokenPublicErrorRegistry } from './nearToken';
import type { ActionsPublicErrorRegistry } from './transaction/actions/actions';
import type { ClientInnerErrorRegistry, ClientPublicErrorRegistry } from '../client/client';
import type { MemoryKeyServicePublicErrorRegistry } from '../keyServices/memoryKeyService/memoryKeyService';
import type { MemorySignerInnerErrorRegistry, MemorySignerPublicErrorRegistry } from '../signers/memorySigner/memorySigner';
import type { $ZodError } from 'zod/v4/core';
import type { KeyPairPublicErrorRegistry } from './keyPair/keyPair';
import type { VerifySignaturePublicErrorRegistry } from './verifySignature';
import type { MessagePublicErrorRegistry } from './message';

export type InternalErrorContext = { cause: unknown };
export type InvalidSchemaErrorContext = { zodError: $ZodError };

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
    VerifySignaturePublicErrorRegistry,
    MessagePublicErrorRegistry,
    NearTokenPublicErrorRegistry,
    NearGasPublicErrorRegistry {}

interface NatErrorRegistry extends NatInnerErrorRegistry, NatPublicErrorRegistry {}

export type NatInternalErrorKind = Extract<keyof NatErrorRegistry, `${string}.Internal`>;

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
