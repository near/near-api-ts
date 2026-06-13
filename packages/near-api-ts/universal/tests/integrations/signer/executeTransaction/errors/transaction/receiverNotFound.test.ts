import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import {
  type Client,
  createMemoryKeyService,
  createMemorySignerFactory,
  deleteAccount,
  type MemoryKeyService,
  type MemorySignerFactory,
  transfer,
} from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('executeTransaction › Transaction.Receiver.NotFound', () => {
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

  it('fails with Transaction.Receiver.NotFound when transferring to a missing account', async () => {
    const nat = createSigner('nat');

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'not-bob',
      },
    });
    assertNatErrKind(tx, 'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound');
  });

  it('fails with Transaction.Receiver.NotFound when deleting a missing account', async () => {
    const nat = createSigner('nat');

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: deleteAccount({ beneficiaryAccountId: 'bob' }),
        receiverAccountId: 'not-bob',
      },
    });
    assertNatErrKind(tx, 'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound');
  });
});
