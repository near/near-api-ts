import { assertNatErrKind } from '@universal/tests/utils/assertNatErrKind';
import { createDefaultClient } from '@universal/tests/utils/common';
import { startSandbox } from '@universal/tests/utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import { type Client, createAccount, createMemoryKeyService, createMemorySignerFactory, type MemoryKeyService, type MemorySignerFactory } from '../../../../../../../../index';

vi.setConfig({ testTimeout: 60000 });

describe('CreateAccount', () => {
  let client: Client;
  let keyService: MemoryKeyService;
  let createSigner: MemorySignerFactory;

  beforeAll(async () => {
    const sandbox = await startSandbox();

    client = await createDefaultClient(sandbox);
    keyService = await createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  it('AlreadyExist', async () => {
    const nat = await createSigner('nat');

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: createAccount(),
        receiverAccountId: 'bob',
      },
    });

    assertNatErrKind(
      res,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist',
    );
  });
});
