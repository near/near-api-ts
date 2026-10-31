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
import {
  createNatError,
  type NatError,
} from '../../../../../src/_common/_common/_common/_common/natError';
import type { NatErrorKind } from '../../../../../types/_common/natError';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('Signer › RecentBlockHash.NotLoaded', () => {
  let client: Client;

  const intent = {
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'nat',
  };

  const timeoutError = () =>
    createNatError({ kind: 'Client.GetRecentBlockHash.Timeout', context: { timeoutMs: 1 } });

  // A signer whose block hash request fails with the given error - the keys still come from the
  // sandbox, and so would its sends
  const createSignerFailingToLoadBlockHash = (error: NatError<NatErrorKind>) =>
    createSigner({
      signerAccountId: 'nat',
      client: {
        safeGetAccessKeys: client.safeGetAccessKeys,
        safeGetRecentBlockHash: (async () => ({
          success: false as const,
          error,
        })) as SignerClient['safeGetRecentBlockHash'],
        safeGetBlock: client.safeGetBlock,
        safeSendSignedTransaction: client.safeSendSignedTransaction,
      },
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executeTransaction fails with RecentBlockHash.NotLoaded and sends nothing', async () => {
    const send = vi.spyOn(client, 'safeSendSignedTransaction');
    const error = timeoutError();
    const signer = createSignerFailingToLoadBlockHash(error);

    const tx = await signer.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.RecentBlockHash.NotLoaded');
    expect(tx.error.context.cause).toBe(error);
    expect(send).not.toHaveBeenCalled();
  });

  it('signTransaction fails with RecentBlockHash.NotLoaded', async () => {
    const error = timeoutError();
    const signer = createSignerFailingToLoadBlockHash(error);

    const signed = await signer.safeSignTransaction({ intent });
    assertNatErrKind(signed, 'Signer.SignTransaction.RecentBlockHash.NotLoaded');
    expect(signed.error.context.cause).toBe(error);
  });

  it.each([
    'Client.GetRecentBlockHash.Args.InvalidSchema',
    'Client.GetRecentBlockHash.Aborted',
    'Client.GetRecentBlockHash.Internal',
  ] as const)('turns %s, which a signer cannot run into, into Internal', async (kind) => {
    // The signer reads only the kind of such an error
    const error = createNatError({ kind, context: null as never });
    const signer = createSignerFailingToLoadBlockHash(error);

    const tx = await signer.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Internal');
    expect(tx.error.context.cause).toBe(error);

    const signed = await signer.safeSignTransaction({ intent });
    assertNatErrKind(signed, 'Signer.SignTransaction.Internal');
    expect(signed.error.context.cause).toBe(error);
  });
});
