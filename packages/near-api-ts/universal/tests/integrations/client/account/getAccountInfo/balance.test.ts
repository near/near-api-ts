import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import {
  addFullAccessKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySignerFactory,
  deleteKey,
  type MemoryKeyService,
  type MemorySignerFactory,
  near,
  randomEd25519KeyPair,
  stake,
  transfer,
} from '../../../../../index';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { createDefaultClient } from '../../../../utils/common';

vi.setConfig({ testTimeout: 60000 });

describe('Get Account Balance', () => {
  let client: Client;
  let keyService: MemoryKeyService;
  let createSigner: MemorySignerFactory;

  const keyPair1 = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: keyPair1.privateKey },
      ],
    });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  // Test#1 ---------------------
  it('Ok: total: 0, available: 0, locked: 0 (storage: 182b, staked: 0)', async () => {
    const nat = await createSigner('nat');

    await nat.executeTransaction({
      intent: {
        actions: [createAccount(), addFullAccessKey(randomEd25519KeyPair())],
        receiverAccountId: 'abc1.nat',
      },
    });

    const info1 = await client.getAccountInfo({ accountId: 'abc1.nat' });
    const { balance } = info1.accountInfo;

    expect(balance.total.near).toBe('0');
    expect(balance.available.near).toBe('0');
    expect(balance.locked.amount.near).toBe('0');
  });

  // Test#2 ---------------------
  it('Ok: total: 1, available: 1, locked: 0 (storage: 182b, staked: 0)', async () => {
    const nat = await createSigner('nat');
    // 1. Create new account
    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          addFullAccessKey(keyPair1),
          transfer({ amount: { near: '1' } }),
        ],
        receiverAccountId: 'abc2.nat',
      },
    });

    const info1 = await client.getAccountInfo({ accountId: 'abc2.nat' });
    const { balance: balance1 } = info1.accountInfo;

    expect(balance1.total.near).toBe('1');
    expect(balance1.available.near).toBe('1');
    expect(balance1.locked.amount.near).toBe('0');

    // 2. Transfer all NEAR tokens
    const abc = await createSigner('abc2.nat');

    await abc.executeTransaction({
      intent: {
        action: transfer({
          amount: near('1').sub({ near: '0.0000446365125' }),
        }),
        receiverAccountId: 'nat',
      },
    });

    const info2 = await client.getAccountInfo({ accountId: 'abc2.nat' });
    const { balance: balance2 } = info2.accountInfo;

    expect(balance2.total.near).toBe('0');
    expect(balance2.available.near).toBe('0');
    expect(balance2.locked.amount.near).toBe('0');
  });

  // Test#3 ---------------------
  it('Ok: total: 2000, available: 500, locked: 1500 (storage: 920b, staked: 1500)', async () => {
    const nat = await createSigner('nat');
    // 1. Create an account with 10 FA keys
    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          addFullAccessKey(keyPair1),
          ...Array(9)
            .fill(0)
            .map(() => addFullAccessKey(randomEd25519KeyPair())),
          transfer({ amount: { near: '2000' } }),
        ],
        receiverAccountId: 'abc3.nat',
      },
    });

    const info1 = await client.getAccountInfo({ accountId: 'abc3.nat' });
    const { balance: balance1 } = info1.accountInfo;

    expect(balance1.total.near).toBe('2000');
    expect(balance1.available.near).toBe('1999.9908');
    expect(balance1.locked.amount.near).toBe('0.0092');

    // 2. Stake 1500
    const abc = await createSigner('abc3.nat');

    await abc.executeTransaction({
      intent: {
        action: stake({
          amount: { near: '1500' },
          validatorPublicKey: randomEd25519KeyPair().publicKey,
        }),
        receiverAccountId: abc.signerAccountId,
      },
    });

    const info2 = await client.getAccountInfo({ accountId: 'abc3.nat' });
    const { balance: balance2 } = info2.accountInfo;

    expect(balance2.total.near).toBe('1999.99995399476875');
    expect(balance2.available.near).toBe('499.99995399476875');
    expect(balance2.locked.amount.near).toBe('1500');

    // 3. Transfer all NEAR tokens
    await abc.executeTransaction({
      intent: {
        action: transfer({
          amount: near('499.99995399476875').sub({ near: '0.0000446365125' }),
        }),
        receiverAccountId: 'nat',
      },
    });

    const info3 = await client.getAccountInfo({ accountId: 'abc3.nat' });
    const { balance: balance3 } = info3.accountInfo;

    expect(balance3.total.near).toBe('1500');
    expect(balance3.available.near).toBe('0');
    expect(balance3.locked.amount.near).toBe('1500');
  });

  // Test#4 ---------------------
  it('Account become a zero cost again after deleting state', async () => {
    const nat = await createSigner('nat');
    // 1. Create a new account with 10 FA keys
    const keyPairs = Array(9)
      .fill(0)
      .map(() => randomEd25519KeyPair());

    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          addFullAccessKey(keyPair1),
          ...keyPairs.map((keyPair) => addFullAccessKey(keyPair)),
          transfer({ amount: { near: '1' } }),
        ],
        receiverAccountId: 'abc4.nat',
      },
    });

    const info1 = await client.getAccountInfo({ accountId: 'abc4.nat' });
    const { balance: balance1 } = info1.accountInfo;

    expect(balance1.total.near).toBe('1');
    expect(balance1.available.near).toBe('0.9908');
    expect(balance1.locked.amount.near).toBe('0.0092');

    // 2. Delete 2 FA keys
    const abc = await createSigner('abc4.nat');

    await abc.executeTransaction({
      intent: {
        actions: [deleteKey(keyPairs[0]), deleteKey(keyPairs[1])],
        receiverAccountId: abc.signerAccountId,
      },
    });

    const info2 = await client.getAccountInfo({ accountId: 'abc4.nat' });
    const { balance: balance2 } = info2.accountInfo;

    expect(balance2.total.near).toBe('0.99994040945');
    expect(balance2.available.near).toBe('0.99994040945');
    expect(balance2.locked.amount.near).toBe('0');

    // 3. Transfer all NEAR tokens
    await abc.executeTransaction({
      intent: {
        action: transfer({
          amount: near('0.99994040945').sub({ near: '0.0000446365125' }), // Gas price for transfer
        }),
        receiverAccountId: 'nat',
      },
    });

    const info3 = await client.getAccountInfo({ accountId: 'abc4.nat' });
    const { balance: balance3 } = info3.accountInfo;

    expect(balance3.total.near).toBe('0');
    expect(balance3.available.near).toBe('0');
    expect(balance3.locked.amount.near).toBe('0');
  });
});
