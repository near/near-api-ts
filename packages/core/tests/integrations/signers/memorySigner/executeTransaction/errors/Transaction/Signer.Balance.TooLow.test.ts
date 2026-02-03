import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  type Client,
  type MemoryKeyService,
  type MemorySignerFactory,
  createMemorySignerFactory,
  transfer,
  createAccount,
  addFullAccessKey,
  randomEd25519KeyPair,
  near,
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
  const keyPair1 = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }, keyPair1],
    });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  it('Transfer too many tokens', async () => {
    const nat = createSigner('nat');

    // 1. Create an account with 10 FA keys
    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          addFullAccessKey(keyPair1),
          ...Array(9)
            .fill(0)
            .map(() => addFullAccessKey(randomEd25519KeyPair())),
          transfer({ amount: { near: '1' } }),
        ],
        receiverAccountId: 'abc.nat',
      },
    });

    const info1 = await client.getAccountInfo({ accountId: 'abc.nat' });
    const { balance: balance1 } = info1.accountInfo;

    expect(balance1.total.near).toBe('1');
    expect(balance1.available.near).toBe('0.9908');
    expect(balance1.locked.amount.near).toBe('0.0092');

    // 2. try to send
    const abc = createSigner('abc.nat');

    const tx = await abc.safeExecuteTransaction({
      intent: {
        action: transfer({
          amount: near('1'),
        }),
        receiverAccountId: 'nat',
      },
    });

    assertNatErrKind(
      tx,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Signer.Balance.TooLow',
    );
  });
});
