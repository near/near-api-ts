import { expect, test } from 'vitest';
import {
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  transfer,
} from '../../../src';
import { log } from '../utils/common';
import { testKeys } from '../utils/testKeys';

test(
  'Execute Transaction on Real Rpc',
  {
    timeout: 30 * 1000,
  },
  async () => {
    const client = await createClient({
      transport: {
        rpcEndpoints: { archival: [{ url: 'https://test.rpc.fastnear.com' }] },
      },
    });

    // biome-ignore format: keep compact
    const keyService = await createMemoryKeyService({
      keySources: [
        { privateKey: testKeys['ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9'] },
        { privateKey: testKeys['ed25519:76ajHU6SdLPEz7YwWR1Ejm3iq96RAhL3MGAkbqXyCZTv'] },
        { privateKey: testKeys['ed25519:6RrJpmSUdKgru2JT9yWWZr2Qkj5mRYEBQqnuxBtxxfEc'] },
        { privateKey: testKeys['ed25519:5JgE5tBqbtd4ghgRqu2SFjxFs1x7GonNuLhXbi4Z2pik'] },
      ],
    });

    const signer1 = await createMemorySigner({
      signerAccountId: 'nat-t1.lantstool.testnet',
      client,
      keyService,
      keyPool: {
        signingKeys: ['ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9'], // will sign only by this key
      },
    });

    // const signer2 = await createMemorySigner({
    //   signerAccountId: 'nat',
    //   client,
    //   keyService,
    // });

    // const accountState = await client.getAccountState({ accountId: 'nat' });
    // log(accountState.accountState.balance.total);

    try {
      const result1 = await signer1.executeTransaction({
        action: transfer({ amount: { yoctoNear: '1' } }),
        receiverAccountId: 'eclipseer.testnet',
      });

      log(result1);
    } catch (e) {
      log(e);
    }

    // const result2 = await signer2.executeTransaction({
    //   action: transfer({ amount: { near: '2' } }),
    //   receiverAccountId: DEFAULT_ACCOUNT_ID,
    // });
    //
    // log(result2);
    //
    // const accountState2 = await client.getAccountState({ accountId: 'nat' });
    // log(accountState2.accountState.balance.total);
  },
);
