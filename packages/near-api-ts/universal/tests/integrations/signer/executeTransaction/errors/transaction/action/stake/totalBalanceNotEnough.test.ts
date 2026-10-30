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

describe('executeTransaction › Action.Stake.TotalBalance.NotEnough', () => {
  let client: Client;
  let keyVault: MemoryVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = createMemoryVault({
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    return () => sandbox.stop();
  });

  it('fails with Action.Stake.TotalBalance.NotEnough when staking more than the balance', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
    });

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: stake({
          amount: near('100000000'),
          validatorPublicKey: randomEd25519KeyPair().publicKey,
        }),
        receiverAccountId: nat.signerAccountId,
      },
    });

    assertNatErrKind(res, 'Signer.ExecuteTransaction.Rpc.Action.Stake.TotalBalance.NotEnough');
  });
});
