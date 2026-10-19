import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryKeyVault,
  createMemorySigner,
  type MemoryKeyVault,
  near,
  randomEd25519KeyPair,
  stake,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.Stake.ProposedStake.BelowThreshold', () => {
  let client: Client;
  let keyVault: MemoryKeyVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = await createMemoryKeyVault({
      keySource: { privateKey: DEFAULT_PRIVATE_KEY },
    });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Stake.ProposedStake.BelowThreshold when the stake is below the seat price', async () => {
    const nat = createMemorySigner({ signerAccountId: 'nat', client, keyVault });

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: stake({
          amount: near('1'),
          validatorPublicKey: randomEd25519KeyPair().publicKey,
        }),
        receiverAccountId: nat.signerAccountId,
      },
    });

    assertNatErrKind(
      res,
      'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.ProposedStake.BelowThreshold',
    );
  });
});
