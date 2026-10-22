import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryKeyVault,
  createMemorySigner,
  createSubAccount,
  type MemoryKeyVault,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.CreateSubAccount.AlreadyExist', () => {
  let client: Client;
  let keyVault: MemoryKeyVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();

    client = createDefaultClient(sandbox);
    keyVault = createMemoryKeyVault({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Action.CreateSubAccount.AlreadyExist when creating an existing account', async () => {
    const errorKind = 'MemorySigner.ExecuteTransaction.Rpc.Action.CreateSubAccount.AlreadyExists';
    const nat = createMemorySigner({ signerAccountId: 'nat', client, keyVault });

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: createSubAccount(),
        receiverAccountId: 'bob',
      },
    });

    assertNatErrKind(tx, errorKind);
  });
});
