import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  type SignerClient,
  transfer,
} from '../../../../../index';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

const countRequests = (fetchCalls: Parameters<typeof fetch>[], method: string) =>
  fetchCalls.filter(([, init]) => JSON.parse(String(init?.body)).method === method).length;

// A promise a fake client method waits for, until the test opens it
const createGate = () => {
  let open = () => {};
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { open, opened };
};

z.config(z.locales.en());
describe('Signer.executeTransaction › Aborted', () => {
  let client: Client;

  const intent = {
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'nat',
  };

  const createSignService = () =>
    createVaultSignService({ vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }) });

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fails for a signal aborted before the call, and signs nothing', async () => {
    const signService = createSignService();
    const signTransaction = vi.spyOn(signService, 'safeSignTransaction');
    const nat = createSigner({ signerAccountId: 'nat', client, signService });

    const tx = await nat.safeExecuteTransaction({
      intent,
      options: { signal: AbortSignal.abort('Not needed anymore') },
    });

    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Aborted');
    expect(tx.error.context.reason).toBe('Not needed anymore');
    expect(signTransaction).not.toHaveBeenCalled();
  });

  it('takes a call aborted while it waits in the queue out of it at once', async () => {
    // nat has one key, and the first transaction holds it while its signing waits for the gate
    const gate = createGate();
    const signService = createSignService();
    const { safeSignTransaction } = signService;
    const signTransaction = vi
      .spyOn(signService, 'safeSignTransaction')
      .mockImplementationOnce(async (args) => {
        await gate.opened;
        return safeSignTransaction(args);
      });

    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService,
      // A call the abort didn't take out would time out here, well before the test does
      taskQueue: { timeoutMs: 10_000 },
    });

    const first = nat.safeExecuteTransaction({ intent });
    await vi.waitFor(() => expect(signTransaction).toHaveBeenCalledTimes(1));

    const controller = new AbortController();
    const second = nat.safeExecuteTransaction({ intent, options: { signal: controller.signal } });

    // The second call finds the key busy and waits in the queue
    await new Promise((resolve) => setTimeout(resolve, 0));
    controller.abort('Not needed anymore');

    const aborted = await second;
    assertNatErrKind(aborted, 'Signer.ExecuteTransaction.Aborted');
    expect(aborted.error.context.reason).toBe('Not needed anymore');

    // A call aborted already doesn't get into the queue at all
    const abortedBefore = await nat.safeExecuteTransaction({
      intent,
      options: { signal: AbortSignal.abort('Not needed either') },
    });
    assertNatErrKind(abortedBefore, 'Signer.ExecuteTransaction.Aborted');
    expect(abortedBefore.error.context.reason).toBe('Not needed either');

    gate.open();
    expect((await first).success).toBe(true);

    // The aborted call was never signed, and the key goes on to the next one
    expect(signTransaction).toHaveBeenCalledTimes(1);
    expect((await nat.safeExecuteTransaction({ intent })).success).toBe(true);
  });

  it('signs nothing for a call aborted while it waits for the block hash', async () => {
    const gate = createGate();
    const getRecentBlockHash = vi.fn<SignerClient['safeGetRecentBlockHash']>(async (args) => {
      await gate.opened;
      return client.safeGetRecentBlockHash(args);
    });

    const signService = createSignService();
    const signTransaction = vi.spyOn(signService, 'safeSignTransaction');

    const nat = createSigner({
      signerAccountId: 'nat',
      client: {
        safeGetAccessKeys: client.safeGetAccessKeys,
        safeGetRecentBlockHash: getRecentBlockHash,
        safeGetBlock: client.safeGetBlock,
        safeSendSignedTransaction: client.safeSendSignedTransaction,
      },
      signService,
    });

    const controller = new AbortController();
    const tx = nat.safeExecuteTransaction({ intent, options: { signal: controller.signal } });
    await vi.waitFor(() => expect(getRecentBlockHash).toHaveBeenCalled());

    controller.abort('Not needed anymore');
    gate.open();

    const aborted = await tx;
    assertNatErrKind(aborted, 'Signer.ExecuteTransaction.Aborted');
    expect(aborted.error.context.reason).toBe('Not needed anymore');
    expect(signTransaction).not.toHaveBeenCalled();
  });

  it('sends nothing for a call aborted while it is being signed', async () => {
    const controller = new AbortController();

    const signService = createSignService();
    const { safeSignTransaction } = signService;
    vi.spyOn(signService, 'safeSignTransaction').mockImplementation(async (args) => {
      controller.abort('Not needed anymore');
      return safeSignTransaction(args);
    });

    const nat = createSigner({ signerAccountId: 'nat', client, signService });

    // The send gets a signal aborted already, so the client fails it before it sends anything
    const tx = await nat.safeExecuteTransaction({
      intent,
      options: { signal: controller.signal },
    });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Aborted');
    expect(tx.error.context.reason).toBe('Not needed anymore');

    // Its nonce is still free, so the next transaction takes it and goes through at the first send.
    // That one is another transaction: the same one with the same nonce would only get the
    // outcome of the first, had it been sent
    vi.restoreAllMocks();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const next = await nat.safeExecuteTransaction({
      intent: { action: transfer({ amount: { yoctoNear: '2' } }), receiverAccountId: 'nat' },
    });
    expect(next.success).toBe(true);
    expect(countRequests(fetchSpy.mock.calls, 'send_tx')).toBe(1);
  });
});
