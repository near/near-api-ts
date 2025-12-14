import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  type Client,
  type MemoryKeyService,
  type MemorySignerFactory,
  createMemorySignerFactory,
  deleteAccount,
  transfer,
} from '../../../../../../../src';
import { createDefaultClient } from '../../../../../../utils/common';
import { startSandbox } from '../../../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';

vi.setConfig({ testTimeout: 60000 });

describe('Signer.Balance.TooLow', () => {
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

  it('Transfer too many tokens', async () => {
    const nat = await createSigner('nat');

    const tx = await nat.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '999888' } }),
        receiverAccountId: 'bob',
      },
    });
    assertNatErrKind(
      tx,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Signer.Balance.TooLow',
    );
  });
});
