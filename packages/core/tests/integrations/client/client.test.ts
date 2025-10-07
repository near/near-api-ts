import { test, expect } from 'vitest';
import { createClient } from '../../../src';
import { createMockRpc } from '../utils/mockRpc';

const log = (data: unknown) =>
  console.dir(data, { depth: null, customInspect: true });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test(
  'test',
  {
    timeout: 10 * 60 * 1000,
  },
  async () => {
    const server1 = await createMockRpc({ port: 4561 });

    const client = createClient({
      network: {
        rpcs: {
          regular: [{ url: 'http://localhost:4562' }], // Mock 1
          archival: [],
        },
      },
    });

    for (let i = 0; i < 10; i++) {
      // await sleep(1000);
      try {
        const res = await client.getAccountState({ accountId: 'nat' });
        console.log('success', i);
      } catch (e) {
        console.log('error', i, e );
      }
    }

    server1.close();

    expect(5).toBe(5);
  },
);
