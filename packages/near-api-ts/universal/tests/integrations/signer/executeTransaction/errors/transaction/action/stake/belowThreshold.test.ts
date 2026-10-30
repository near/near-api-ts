import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  type MemoryVault,
  near,
  randomEd25519KeyPair,
  stake,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.Stake.ProposedStake.BelowThreshold', () => {
  let client: Client;
  let keyVault: MemoryVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = await createMemoryVault({
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Stake.ProposedStake.BelowThreshold when the stake is below the seat price', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
    });

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
      'Signer.ExecuteTransaction.Rpc.Action.Stake.ProposedStake.BelowThreshold',
    );
  });
});
