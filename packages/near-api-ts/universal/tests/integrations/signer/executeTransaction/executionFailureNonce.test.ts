import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createSubAccount,
  createVaultSignService,
  transfer,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

const countRequests = (fetchCalls: Parameters<typeof fetch>[], method: string) =>
  fetchCalls.filter(([, init]) => JSON.parse(String(init?.body)).method === method).length;

z.config(z.locales.en());
describe('Signer.executeTransaction', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('keeps the nonce of a transaction that failed while it ran', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    // bob exists, so the transaction fails when it runs - once it was converted and used the nonce
    const failed = await nat.safeExecuteTransaction({
      intent: { action: createSubAccount(), receiverAccountId: 'bob' },
    });
    assertNatErrKind(failed, 'Signer.ExecuteTransaction.Rpc.Action.CreateSubAccount.AlreadyExists');

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const tx = await nat.safeExecuteTransaction({
      intent: { action: transfer({ amount: { yoctoNear: '1' } }), receiverAccountId: 'bob' },
    });

    // The next transaction takes the next nonce, so no send of it is refused for a used one
    expect(tx.success).toBe(true);
    expect(countRequests(fetchSpy.mock.calls, 'send_tx')).toBe(1);
    fetchSpy.mockRestore();
  });

  it('keeps the nonce of a transaction whose deserializer failed', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    // A deserializer gets the details of a transaction that ran - so it was converted and used
    // the nonce
    const failed = await nat.safeExecuteTransaction({
      intent: { action: transfer({ amount: { yoctoNear: '1' } }), receiverAccountId: 'bob' },
      options: {
        deserializeResultData: () => {
          throw new Error('Bad data');
        },
      },
    });
    assertNatErrKind(failed, 'Signer.ExecuteTransaction.DeserializeResultData.Failed');

    // Another transaction: the same one with the same nonce would only get the first one's outcome
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const tx = await nat.safeExecuteTransaction({
      intent: { action: transfer({ amount: { yoctoNear: '2' } }), receiverAccountId: 'bob' },
    });

    expect(tx.success).toBe(true);
    expect(countRequests(fetchSpy.mock.calls, 'send_tx')).toBe(1);
    fetchSpy.mockRestore();
  });
});
