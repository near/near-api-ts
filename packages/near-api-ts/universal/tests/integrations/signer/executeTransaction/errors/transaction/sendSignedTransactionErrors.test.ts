import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  type SignerClient,
  transfer,
} from '../../../../../../index';
import {
  createNatError,
  type NatError,
} from '../../../../../../src/_common/_common/_common/_common/natError';
import type { NatErrorKind } from '../../../../../../types/_common/natError';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('executeTransaction › sendSignedTransaction errors', () => {
  let client: Client;

  const intent = {
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'nat',
  };

  // A signer whose every send fails with the given error - the keys and the block hash
  // still come from the sandbox
  const createSignerFailingToSend = (error: NatError<NatErrorKind>) => {
    const send = vi.fn(async () => ({ success: false as const, error }));

    const signer = createSigner({
      signerAccountId: 'nat',
      client: {
        safeGetAccessKeys: client.safeGetAccessKeys,
        safeGetRecentBlockHash: client.safeGetRecentBlockHash,
        safeSendSignedTransaction: send as SignerClient['safeSendSignedTransaction'],
      },
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    return { signer, send };
  };

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('passes a send error on under its own prefix, with its context', async () => {
    const { signer } = createSignerFailingToSend(
      createNatError({ kind: 'Client.SendSignedTransaction.Timeout', context: { timeoutMs: 1 } }),
    );

    const tx = await signer.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Timeout');
    expect(tx.error.context.timeoutMs).toBe(1);
  });

  it('passes Rpc.Nonce.Invalid on after three sends with a new nonce', async () => {
    const { signer, send } = createSignerFailingToSend(
      createNatError({
        kind: 'Client.SendSignedTransaction.Rpc.Nonce.Invalid',
        context: {
          info: { transactionNonce: 1, accessKeyNonce: 1 },
          signedTransactionBorsh64: '',
        },
      }),
    );

    const tx = await signer.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Rpc.Nonce.Invalid');
    expect(send).toHaveBeenCalledTimes(3);
  });

  it('passes Rpc.BlockHash.Expired on after three sends with a fresh block hash', async () => {
    const { signer, send } = createSignerFailingToSend(
      createNatError({
        kind: 'Client.SendSignedTransaction.Rpc.BlockHash.Expired',
        context: { info: null, signedTransactionBorsh64: '' },
      }),
    );

    const tx = await signer.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Rpc.BlockHash.Expired');
    expect(send).toHaveBeenCalledTimes(3);
  });

  it.each([
    'Client.SendSignedTransaction.Args.InvalidSchema',
    'Client.SendSignedTransaction.Internal',
    'Client.SendSignedTransaction.Rpc.Signature.Invalid',
    'Client.SendSignedTransaction.Aborted',
    'Client.SendSignedTransaction.DeserializeResultData.Failed',
    'Client.SendSignedTransaction.DeserializeActionSummaries.Failed',
    'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed',
  ] as const)('turns %s, which a signer cannot run into, into Internal', async (kind) => {
    // The signer reads only the kind of such an error
    const error = createNatError({ kind, context: null as never });
    const { signer } = createSignerFailingToSend(error);

    const tx = await signer.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Internal');
    expect(tx.error.context.cause).toBe(error);
  });
});
