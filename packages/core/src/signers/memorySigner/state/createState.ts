import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { CreateState } from 'nat-types/signers/memorySigner/state';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';

const getBlockHash = async (signerContext: MemorySignerContext) => {
  const block = await signerContext.client.safeGetBlock();
  return block.ok ? result.ok(block.value.rawRpcResult.header.hash) : block;
};

export const createState: CreateState = async (signerContext) => {
  const blockHash = await getBlockHash(signerContext);

  if (!blockHash.ok)
    return result.err(
      createNatError({
        kind: 'CreateMemorySigner.CreateState.Failed',
        context: { cause: blockHash.error },
      }),
    );

  const state = {
    blockHash: blockHash.value,
  };

  // Refetch block every 15 minutes (to keep it fresh for transaction)
  const refetchBlockHashIntervalId = setInterval(async () => {
    const blockHash = await getBlockHash(signerContext);
    // We don't expect a situation, when the client won't be able to fetch the fresh block
    // more than a 1-2 times. It's fine, cuz block is valid during at least next 24h,
    // and we fetch it every 15 min. But it's not a realistic case, if some app will
    // keep the signer live after 24h without connection with any RPC server;
    if (!blockHash.ok) return;

    state.blockHash = blockHash.value;
  }, 900_000);

  const clearIntervals = () => {
    clearInterval(refetchBlockHashIntervalId);
  };

  return result.ok({
    getBlockHash: () => state.blockHash,
    clearIntervals,
  });
};
