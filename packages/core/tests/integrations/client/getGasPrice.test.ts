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


  // try {
  //   throw new Error({ a: '3213123' });
  // } catch (error) {
  //   console.log(error);
  // }

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
