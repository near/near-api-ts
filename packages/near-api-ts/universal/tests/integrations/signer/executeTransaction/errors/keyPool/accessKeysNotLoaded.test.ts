import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  transfer,
} from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('executeTransaction › KeyPool.AccessKeys.NotLoaded', async () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('loads the access keys again after a failed load', async () => {
    let isFirstLoad = true;

    const nat = createSigner({
      signerAccountId: 'nat',
      client: {
        ...client,
        // The first load fails - the client is asked for an invalid account id
        safeGetAccessKeys: async (args) => {
          if (!isFirstLoad) return client.safeGetAccessKeys(args);
          isFirstLoad = false;
          return client.safeGetAccessKeys({ ...args, accountId: '' });
        },
      },
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    const intent = {
      action: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'nat',
    };

    const failed = await nat.safeExecuteTransaction({ intent });
    assertNatErrKind(failed, 'Signer.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded');

    const executed = await nat.safeExecuteTransaction({ intent });
    expect(executed.success).toBe(true);
  });
});
