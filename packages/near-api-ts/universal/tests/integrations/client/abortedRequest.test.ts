import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  transfer,
} from '../../../index';
import { assertNatErrKind } from '../../utils/assertNatErrKind';
import { createDefaultClient } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';

describe('client › an aborted request', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with Aborted for a signal aborted before the call', async () => {
    const signal = AbortSignal.abort('Not needed anymore');

    const block = await client.safeGetBlock({ options: { signal } });
    assertNatErrKind(block, 'Client.GetBlock.Aborted');
    expect(block.error.context.reason).toBe('Not needed anymore');

    const accessKeys = await client.safeGetAccessKeys({ accountId: 'nat', options: { signal } });
    assertNatErrKind(accessKeys, 'Client.GetAccessKeys.Aborted');
  });

  it('fails with Aborted for a signal aborted while the request is on the way', async () => {
    const controller = new AbortController();

    const block = client.safeGetBlock({ options: { signal: controller.signal } });
    controller.abort('Not needed anymore');

    const result = await block;
    assertNatErrKind(result, 'Client.GetBlock.Aborted');
    expect(result.error.context.reason).toBe('Not needed anymore');
  });

  it('fails with Aborted for a signal aborted before a transaction is sent', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    const signedTransaction = await nat.signTransaction({
      intent: {
        action: transfer({ amount: { yoctoNear: '1' } }),
        receiverAccountId: 'nat',
      },
    });

    const sent = await client.safeSendSignedTransaction({
      signedTransaction,
      options: { signal: AbortSignal.abort() },
    });
    assertNatErrKind(sent, 'Client.SendSignedTransaction.Aborted');
  });
});
