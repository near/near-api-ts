import type { BlockHash, Result } from '../../../../../../types/_common/common';
import type { SignerClient } from '../../../../../../types/signer/signerClient';
import {
  isNatErrorOf,
  type NatError,
} from '../../../../../_common/_common/_common/_common/natError';
import { resultNatError } from '../../../../../_common/_common/_common/result';

type LoadRecentBlockHashArgs = {
  client: SignerClient;
  refreshCache?: boolean;
};

// A request that failed on the way is the signer's own error. The signer passes valid args and no
// signal, so any other failure is a bug - it becomes the Internal of the method that asked
export const loadRecentBlockHash = async ({
  client,
  refreshCache,
}: LoadRecentBlockHashArgs): Promise<
  Result<BlockHash, NatError<'Signer.RecentBlockHash.NotLoaded'>>
> => {
  const blockHash = await client.safeGetRecentBlockHash({ options: { refreshCache } });
  if (blockHash.success) return blockHash;

  const { error } = blockHash;

  if (
    isNatErrorOf(error, [
      'Client.GetRecentBlockHash.PreferredRpc.NotFound',
      'Client.GetRecentBlockHash.Timeout',
      'Client.GetRecentBlockHash.Exhausted',
    ])
  )
    return resultNatError('Signer.RecentBlockHash.NotLoaded', { cause: error });

  throw error;
};
