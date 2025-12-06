import { test } from 'vitest';
import { withSandbox } from '../utils/sandbox/startSandbox';
import { createClient } from '../../../src';
import { log } from '../utils/common';

const gasPrice = async ({ rpcUrl }: { rpcUrl: string }) => {
  const client = await createClient({
    transport: {
      rpcEndpoints: { regular: [{ url: rpcUrl }] },
    },
  });

  const res = await client.getAccountInfo({ accountId: 'nat' });
  log(res);
};
// TODO rename state to info
test(
  'Gas Price',
  {
    timeout: 30 * 1000,
  },
  async () => withSandbox(gasPrice),
);
