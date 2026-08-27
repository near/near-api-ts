import type { AccountContract } from '../../../../../../types/client/methods/account/getAccountInfo';
import type { RpcQueryViewAccountResult } from './handleResult';

// An account with no wasm of its own reports this placeholder instead of a hash:
// it is base58 of the all-zero hash nearcore falls back to.
const NoLocalContractCodeHash = '11111111111111111111111111111111';

/**
 * Nearcore keeps the account's contract as a single enum (`None` / `Local` /
 * `Global` / `GlobalByAccount`), but the RPC view flattens it into three
 * independent fields. Only one of them ever carries a value, and nearcore reads
 * them back in exactly this order, so we fold them back into one union.
 */
export const getAccountContract = (accountInfo: RpcQueryViewAccountResult): AccountContract => {
  if (accountInfo.globalContractAccountId)
    return { status: 'Linked', globalContractAccountId: accountInfo.globalContractAccountId };

  if (accountInfo.globalContractHash)
    return { status: 'Pinned', globalContractWasmHash: accountInfo.globalContractHash };

  if (accountInfo.codeHash !== NoLocalContractCodeHash)
    return { status: 'Deployed', localContractWasmHash: accountInfo.codeHash };

  return { status: 'NoContract' };
};
