import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  type Client,
  type MemoryKeyService,
  type MemorySignerFactory,
  createMemorySignerFactory,
  deleteAccount,
  transfer,
} from '../../../../../../../index';
import { createDefaultClient } from '../../../../../../utils/common';
import { startSandbox } from '../../../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';

vi.setConfig({ testTimeout: 60000 });

describe('Receiver.NotFound', () => {
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

  it('Transfer', async () => {
    const nat = createSigner('nat');

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'not-bob',
      },
    });
    assertNatErrKind(
      tx,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound',
    );
  });

  it('Delete Account', async () => {
    const nat = createSigner('nat');

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: deleteAccount({ beneficiaryAccountId: 'bob' }),
        receiverAccountId: 'not-bob',
      },
    });
    assertNatErrKind(
      tx,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound',
    );
  });
});
