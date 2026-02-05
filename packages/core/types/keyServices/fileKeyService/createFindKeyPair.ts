import type { KeyPair } from 'nat-types/_common/keyPair/keyPair';
import type { PublicKey } from 'nat-types/_common/crypto';
import type { NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';

type FindKeyPairArgs = { publicKey: PublicKey };

type FindKeyPairError =
  | NatError<'MemoryKeyService.FindKeyPair.Args.InvalidSchema'>
  | NatError<'MemoryKeyService.FindKeyPair.NotFound'>
  | NatError<'MemoryKeyService.FindKeyPair.Internal'>;

export type SafeFindKeyPair = (
  args: FindKeyPairArgs,
) => Result<KeyPair, FindKeyPairError>;

export type FindKeyPair = (args: FindKeyPairArgs) => KeyPair;
