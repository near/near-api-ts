import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../../_common/common';
import type { PublicKey } from '../../_common/crypto';
import type { KeyPair } from '../../_common/keyPair/keyPair';

type FindKeyPairArgs = { publicKey: PublicKey };

type FindKeyPairError =
  | NatError<'MemoryKeyService.FindKeyPair.Args.InvalidSchema'>
  | NatError<'MemoryKeyService.FindKeyPair.NotFound'>
  | NatError<'MemoryKeyService.FindKeyPair.Internal'>;

export type SafeFindKeyPair = (
  args: FindKeyPairArgs,
) => Result<KeyPair, FindKeyPairError>;

export type FindKeyPair = (args: FindKeyPairArgs) => KeyPair;
