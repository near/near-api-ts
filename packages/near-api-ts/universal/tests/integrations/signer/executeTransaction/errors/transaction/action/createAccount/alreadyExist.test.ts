import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySignerFactory,
  type MemoryKeyService,
  type MemorySignerFactory,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.CreateAccount.AlreadyExist', () => {
  let client: Client;
  let keyService: MemoryKeyService;
  let createSigner: MemorySignerFactory;

  beforeAll(async () => {
    const sandbox = await startSandbox();

    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Action.CreateAccount.AlreadyExist when creating an existing account', async () => {
    const errorKind =
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist';
    const nat = createSigner('nat');

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: createAccount(),
        receiverAccountId: 'bob',
      },
    });

    assertNatErrKind(tx, errorKind);
  });
});
