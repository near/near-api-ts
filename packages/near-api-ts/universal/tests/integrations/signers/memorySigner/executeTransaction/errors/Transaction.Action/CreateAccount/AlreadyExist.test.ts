import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  createAccount,
  type Client,
  type MemoryKeyService,
  type MemorySignerFactory,
  createMemorySignerFactory,
} from '../../../../../../../../index';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';

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
