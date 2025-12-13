import type { BlockHash, Result } from 'nat-types/_common/common';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { NatError } from '@common/natError';
import type { GetBlockError } from 'nat-types/client/methods/block/getBlock';

export type CreateStateErrorVariant = {
  kind: 'CreateMemorySigner.CreateState.Failed';
  context: { cause: GetBlockError };
};

export type State = {
  getBlockHash: () => BlockHash;
  clearIntervals: () => void;
};

export type CreateStateError =
  NatError<'CreateMemorySigner.CreateState.Failed'>;

export type CreateState = (
  signerContext: MemorySignerContext,
) => Promise<Result<State, CreateStateError>>;
