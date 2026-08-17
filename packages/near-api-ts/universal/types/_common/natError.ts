import type { $ZodError } from 'zod/v4/core';
import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { ClientInnerErrorRegistry, ClientPublicErrorRegistry } from '../client/client';
import type { MemoryKeyServicePublicErrorRegistry } from '../memoryKeyService/memoryKeyService';
import type {
  MemorySignerInnerErrorRegistry,
  MemorySignerPublicErrorRegistry,
} from '../signer/memorySigner';
import type { ResultErr } from './common';
import type { KeyPairPublicErrorRegistry } from './keyPairs/keyPair';
import type { MessagePublicErrorRegistry } from './message';
import type { NearGasPublicErrorRegistry } from './nearGas';
import type { NearTokenPublicErrorRegistry } from './nearToken';
import type { ActionsPublicErrorRegistry } from './transaction/actions/delegableActions/actions';
import type { SignDelegationPublicErrorRegistry } from './transaction/signDelegation';
import type { SignTransactionPublicErrorRegistry } from './transaction/signTransaction';
import type { VerifySignaturePublicErrorRegistry } from './verifySignature';

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
    SignTransactionPublicErrorRegistry,
    SignDelegationPublicErrorRegistry,
    VerifySignaturePublicErrorRegistry,
    MessagePublicErrorRegistry,
    NearTokenPublicErrorRegistry,
    NearGasPublicErrorRegistry {}

interface NatErrorRegistry extends NatInnerErrorRegistry, NatPublicErrorRegistry {}

export type NatInternalErrorKind = Extract<keyof NatErrorRegistry, `${string}.Internal`>;

// TODO split on inner/public errors - we want to show only public errors in isNatError
export type NatErrorKind = keyof NatErrorRegistry;
export type ContextFor<K extends NatErrorKind> = NatErrorRegistry[K];

export type CreateNatErrorArgs<K extends NatErrorKind, C extends ContextFor<K> = ContextFor<K>> = {
  kind: K;
  context: C;
};

export type CreateResultNatError = <
  K extends NatErrorKind,
  C extends ContextFor<K> = ContextFor<K>,
>(
  kind: K,
  context: C,
) => ResultErr<NatError<K, C>>;
