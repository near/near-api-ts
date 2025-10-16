import { test, expect } from 'vitest';
import { createClient } from '../../../src';
import { createMockRpc } from '../utils/mockRpc';
import { createDefaultTransport } from '../../../src/client/transport/createDefaultTransport';

const log = (data: unknown) =>
  console.dir(data, { depth: null, customInspect: true });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test(
  'test',
  {
    timeout: 60 * 1000,
  },
  async () => {
    // const server1 = await createMockRpc({ port: 4561 });
    const client = createClient({
      transport: createDefaultTransport({
        rpcEndpoints: {
          regular: [
            { url: 'https://free.rpc.fastnear.com' },
            { url: 'https://near.blockpi.network/v1/rpc/public' },
            // { url: 'https://getblock.io/nodes/near/' }, // Error - html
            // { url: 'https://allthatnode.com/protocol/near.dsrv' }, // Error - html
            // { url: 'https://near.drpc.org/' }, // Error - custom error format
          ],
          archival: [{ url: 'https://1rpc.io/near' }],
        },
        requestPolicy: {
          // rpcTypePreferences: ['archival'],
        },
      }),
    });

    // const res = await client.getAccountState({
    //   accountId: 'near',
    //   atMomentOf: { blockHeight: 212788565 },
    // });
    // console.log('FINAL RESULT ', res);

    try {
      // const res = await client.getAccountKey({
      //   accountId: 'eclipseeer.near',
      //   publicKey: 'ed25519:3Dhkm2g9gKHQNeinRA1eH9ModH9aK3iJaw1uuKsRUuR1',
      // })
      const res = await client.getAccountState({
        accountId: 'near',
        // atMomentOf: { blockHeight: 160839194 }, // 212788565
        // atMomentOf: { blockHash: 'UQcU8hMLAG96mBFEW8rwn5hj1icKbgVUE4G3QKUB5gy' }, // 212788565
      });
      console.log('FINAL RESULT ', res);
    } catch (e) {
      console.dir(e, { depth: null, customInspect: true });
    }

    console.log('---------------------');

    // for (let i = 0; i < 10; i++) {
    //   // await sleep(1000);
    //   try {
    //     const res = await client.getAccountState({ accountId: 'nat' });
    //     console.log('success', i);
    //   } catch (e) {
    //     console.log('error', i, e );
    //   }
    // }
    //
    // server1.close();

    expect(5).toBe(5);
  },
);
