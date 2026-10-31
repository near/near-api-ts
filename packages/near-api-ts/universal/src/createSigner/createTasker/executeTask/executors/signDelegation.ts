import type { BlockHeight, Result } from '../../../../../types/_common/common';
import type { DelegationIntentExpiration } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import type { SignDelegationOutput } from '../../../../../types/_common/transaction/signDelegation';
import type { PoolKey } from '../../../../../types/signer/inner/keyPool';
import type { SignDelegationTask } from '../../../../../types/signer/inner/taskQueue';
import type { SignerContext } from '../../../../../types/signer/signer';
import type { SignerClient } from '../../../../../types/signer/signerClient';
import { isNatErrorOf, type NatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';

// A delegation takes its nonce from the channel the key's transactions use, but nearcore checks it
// only when a relayer's transaction runs the delegation - whenever that is - and then sets the
// key's nonce to it. Signed with the next nonce, it would be voided by the key's next transaction:
// that one fails with Nonce.Invalid until the delegation lands, and its retry takes the same nonce.
// So a delegation jumps ahead and leaves room for this many transactions to land before it; once
// it lands, the key's next transaction fails with Nonce.Invalid once and moves above it on the retry
const delegationNonceGap = 100;

type GetExpirationArgs = {
  client: SignerClient;
  expiration: DelegationIntentExpiration;
};

// A height is taken as it is, a number of blocks counts from the latest block. A request that
// failed on the way is the signer's own error; the signer passes valid args and no signal, so any
// other failure is a bug - it becomes the Internal of signDelegation
const getExpiration = async ({
  client,
  expiration,
}: GetExpirationArgs): Promise<
  Result<{ blockHeight: BlockHeight }, NatError<'Signer.BlockHeight.NotLoaded'>>
> => {
  if (expiration.inBlocks === undefined) return result.ok({ blockHeight: expiration.blockHeight });

  const block = await client.safeGetBlock({ blockReference: 'LatestOptimisticBlock' });

  if (block.success)
    return result.ok({ blockHeight: block.data.rawRpcResult.header.height + expiration.inBlocks });

  if (
    isNatErrorOf(block.error, [
      'Client.GetBlock.PreferredRpc.NotFound',
      'Client.GetBlock.Timeout',
      'Client.GetBlock.Exhausted',
      'Client.GetBlock.Rpc.NotSynced',
    ])
  )
    return resultNatError('Signer.BlockHeight.NotLoaded', { cause: block.error });

  throw block.error;
};

type Execute = () => Promise<
  Result<
    SignDelegationOutput,
    NatError<'Signer.BlockHeight.NotLoaded'> | NatError<'Signer.SignDelegation.Internal'>
  >
>;

export const signDelegation = async (
  signerContext: SignerContext,
  task: SignDelegationTask,
  key: PoolKey,
): Promise<void> => {
  const execute: Execute = wrapInternalError('Signer.SignDelegation.Internal', async () => {
    const expiration = await getExpiration({
      client: signerContext.client,
      expiration: task.delegationIntent.expiration,
    });
    if (!expiration.success) return expiration;

    // Ahead of the key's transactions and of its delegations signed so far, so that the
    // delegations stay valid in the order they were signed
    const nonce = Math.max(key.nonce, key.lastDelegationNonce ?? 0) + delegationNonceGap;

    const signedDelegation = await signerContext.signService.safeSignDelegation({
      delegation: {
        ...task.delegationIntent,
        expiration: expiration.data,
        delegator: {
          accountId: signerContext.signerAccountId,
          publicKey: key.publicKey,
          replayProtection: { nonce },
        },
      },
    });

    // TODO A key deleted from the vault fails here - to be solved by syncing the vault
    //  and the signer; until then the failure is reported as Internal
    if (!signedDelegation.success)
      return resultNatError('Signer.SignDelegation.Internal', { cause: signedDelegation.error });

    key.setLastDelegationNonce(nonce);
    return result.ok(signedDelegation.data);
  });

  const delegationResult = await execute();
  signerContext.tasker.completeTask(task.taskId, delegationResult);
};
