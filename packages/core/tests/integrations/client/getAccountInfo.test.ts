import { test } from 'vitest';
import { withSandbox } from '../utils/sandbox/startSandbox';
import { createClient } from '../../../src';
import { log } from '../utils/common';

const testFn = async ({ rpcUrl }: { rpcUrl: string }) => {
  const client = await createClient({
    transport: {
      rpcEndpoints: { regular: [{ url: rpcUrl }] },
    },
  });

  try {
    const res = await client.getAccountState({ accountId: 'nat2№' });
    log(res);
  } catch (e) {
    log(e);
  }
};

test(
  'GetAccountInfo',
  {
    timeout: 30 * 1000,
  },
  async () => withSandbox(testFn),
);
