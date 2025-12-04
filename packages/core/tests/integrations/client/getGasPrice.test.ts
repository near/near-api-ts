import { test } from 'vitest';
import { withSandbox } from '../utils/sandbox/startSandbox';
import { safeCreateClient } from '../../../src';
import { log } from '../utils/common';

const gasPrice = async ({ rpcUrl }: { rpcUrl: string }) => {
  const client = await safeCreateClient({
    transport: {
      rpcEndpoints: { regular: [{ url: rpcUrl }] },
    },
  });


  const res = await client.getAccountState({ accountId: 'nat'})
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
