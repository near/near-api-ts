import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySigner,
  type MemoryKeyService,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.CreateAccount.AlreadyExist', () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();

    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Action.CreateAccount.AlreadyExist when creating an existing account', async () => {
    const errorKind = 'MemorySigner.ExecuteTransaction.Rpc.Action.CreateAccount.AlreadyExists';
    const nat = createMemorySigner({ signerAccountId: 'nat', client, keyService });

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: createAccount(),
        receiverAccountId: 'bob',
      },
    });

    assertNatErrKind(tx, errorKind);
  });
});
