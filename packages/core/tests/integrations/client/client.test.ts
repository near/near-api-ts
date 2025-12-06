import { test, expect } from 'vitest';
import { createClient } from '../../../src';
import { createMockRpc } from '../utils/mockRpc';

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
    const client = await createClient({
      transport: {
        rpcEndpoints: {
          regular: [
            { url: 'https://getblock.io1/nodes/near' }, // Error - html
            { url: 'https://free.rpc.fastnear.com1' },
            { url: 'https://near.blockpi.network/v1/rpc/public' },
            // { url: 'https://getblock.io/nodes/near/' }, // Error - html
            // { url: 'https://allthatnode.com/protocol/near.dsrv' }, // Error - html
            // { url: 'https://near.drpc.org/' }, // Error - custom error format
          ],
          // archival: [{ url: 'https://1rpc.io/near' }],
        },
      },
    });

    try {
      // const res = await client.getAccountKey({
      //   accountId: 'eclipseeer.near',
      //   publicKey: 'ed25519:3Dhkm2g9gKHQNeinRA1eH9ModH9aK3iJaw1uuKsRUuR1',
      // })
      // const controller = new AbortController();

      // setTimeout(() => {
      //   controller.abort(new Error('aborted by user'));
      // }, 5000);

      const res = await client.getAccountInfo({
        accountId: 'near',
        atMomentOf: { blockHeight: 160839194 }, // 212788565
        // atMomentOf: { blockHash: 'UQcU8hMLAG96mBFEW8rwn5hj1icKbgVUE4G3QKUB5gy' }, // 212788565
        policies: {
          transport: {
            // rpcTypePreferences: ['Archival'],
            timeouts: {
              // requestMs: 1500,
              // attemptMs: 1000,
            },
            rpc: {
              maxAttempts: 3,
              retryBackoff: {
                minDelayMs: 100,
                maxDelayMs: 1000,
              },
            },
            failover: {
              maxRounds: 2,
              nextRpcDelayMs: 50,
              nextRoundDelayMs: 1000,
            },
          },
        },
        options: {
          // signal: controller.signal,
        },
      });

      console.log('FINAL RESULT ', res);
    } catch (e: any) {
      console.log(e?.request?.url, e?.message);
    }

    console.log('---------------------');

    expect(5).toBe(5);
  },
);
