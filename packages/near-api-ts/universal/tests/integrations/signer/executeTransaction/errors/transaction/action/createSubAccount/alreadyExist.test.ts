import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createSubAccount,
  createVaultSignService,
  type MemoryVault,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.CreateSubAccount.AlreadyExist', () => {
  let client: Client;
  let keyVault: MemoryVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();

    client = createDefaultClient(sandbox);
    keyVault = createMemoryVault({
      privateKeys: [DEFAULT_PRIVATE_KEY],
    });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Action.CreateSubAccount.AlreadyExist when creating an existing account', async () => {
    const errorKind = 'Signer.ExecuteTransaction.Rpc.Action.CreateSubAccount.AlreadyExists';
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
    });

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: createSubAccount(),
        receiverAccountId: 'bob',
      },
    });

    assertNatErrKind(tx, errorKind);
  });
});
