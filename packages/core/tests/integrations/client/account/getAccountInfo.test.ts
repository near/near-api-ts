import { expect, test } from 'vitest';
import { withSandbox } from '../../../utils/sandbox/startSandbox';
import { createClient } from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

// TODO Separate between different tests
test(
  'GetAccountInfo',
  {
    timeout: 30 * 1000,
  },
  async () =>
    withSandbox(async ({ rpcUrl }: { rpcUrl: string }) => {
      const client = createClient({
        transport: {
          rpcEndpoints: { archival: [{ url: rpcUrl }] },
        },
      });

      const res1 = await client.safeGetAccountInfo({ accountId: 'nat' });
      expect(res1.ok);

      const res11 = await client.getAccountInfo({ accountId: 'nat' });
      expect(res11.rawRpcResult);

      const res2 = await client.safeGetAccountInfo({
        accountId: 'nat',
        // @ts-expect-error
        atMomentOf: 123,
      });
      assertNatErrKind(res2, 'Client.GetAccountInfo.Args.InvalidSchema');

      const res3 = await client.safeGetAccountInfo({
        accountId: 'nat',
        atMomentOf: {
          blockHash: 'UQcU8hMLAG96mBFEW8rwn5hj1icKbgVUE4G3QKUB5gy', // Invalid
        },
      });
      assertNatErrKind(res3, 'Client.GetAccountInfo.Rpc.Block.NotFound');

      const res4 = await client.safeGetAccountInfo({
        accountId: 'nat123',
        atMomentOf: 'LatestNearFinalBlock',
      });
      assertNatErrKind(res4, 'Client.GetAccountInfo.Rpc.Account.NotFound');
    }),
);
