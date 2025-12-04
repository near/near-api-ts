import { test } from 'vitest';
import { withSandbox } from '../utils/sandbox/startSandbox';
import { createClient } from '../../../src';
import { log } from '../utils/common';

test(
  'GetAccountInfo',
  {
    timeout: 30 * 1000,
  },
  async () =>
    withSandbox(async ({ rpcUrl }: { rpcUrl: string }) => {
      const client = await createClient({
        transport: {
          rpcEndpoints: { regular: [{ url: rpcUrl }] },
        },
      });

      try {
        const res = await client.getAccountInfo({ accountId: 'nat' });
        log(res);
      } catch (e) {
        log(e);
      }
    }),
);
