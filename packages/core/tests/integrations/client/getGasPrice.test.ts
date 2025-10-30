import { test } from 'vitest';
import { withSandbox } from '../utils/sandbox/startSandbox';
import { createClient } from '../../../src';

const gasPrice = async ({ rpcUrl }: { rpcUrl: string }) => {
  const client = await createClient({
    transport: {
      rpcEndpoints: { regular: [{ url: rpcUrl }] },
    },
  });

  const res = await client.getGasPrice({ atMomentOf: { blockHeight: 1 } });
  console.log(res);
};

test(
  'Gas Price',
  {
    timeout: 30 * 1000,
  },
  async () => withSandbox(gasPrice),
);
