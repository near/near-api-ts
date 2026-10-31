import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  type SendSignedTransactionDeserializeActionSummariesArgs,
  type SendSignedTransactionDeserializeExecutionStepsArgs,
  type SendSignedTransactionDeserializeResultDataArgs,
  type SignerClient,
  transfer,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('Signer.executeTransaction › the args it sends with', () => {
  let client: Client;

  const intent = {
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'nat',
  };

  // A signer whose sends go through the sandbox client and are recorded
  const createSpiedSigner = () => {
    const send = vi.fn(client.safeSendSignedTransaction);

    const signer = createSigner({
      signerAccountId: 'nat',
      client: {
        safeGetAccessKeys: client.safeGetAccessKeys,
        safeGetRecentBlockHash: client.safeGetRecentBlockHash,
        safeGetBlock: client.safeGetBlock,
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

  it('sends the transaction with the stage and the options it got', async () => {
    const { signer, send } = createSpiedSigner();

    const transportPolicy = { rpc: { maxAttempts: 2 } };
    const { signal } = new AbortController();
    const deserializeResultData = ({
      rawData,
    }: SendSignedTransactionDeserializeResultDataArgs) => ({
      rawData,
    });
    const deserializeActionSummaries = ({
      rawActionSummaries,
    }: SendSignedTransactionDeserializeActionSummariesArgs) =>
      rawActionSummaries.map(({ actionType }) => actionType);
    const deserializeExecutionSteps = ({
      rawExecutionSteps,
    }: SendSignedTransactionDeserializeExecutionStepsArgs) => rawExecutionSteps.length;

    const tx = await signer.executeTransaction({
      intent,
      minimalProcessingStage: 'CompletedFinal',
      options: {
        transportPolicy,
        signal,
        deserializeResultData,
        deserializeActionSummaries,
        deserializeExecutionSteps,
      },
    });

    // The very values it got
    const [sendArgs] = send.mock.calls[0];
    expect(sendArgs.minimalProcessingStage).toBe('CompletedFinal');
    expect(sendArgs.options?.transportPolicy).toBe(transportPolicy);
    expect(sendArgs.options?.signal).toBe(signal);
    expect(sendArgs.options?.deserializeResultData).toBe(deserializeResultData);
    expect(sendArgs.options?.deserializeActionSummaries).toBe(deserializeActionSummaries);
    expect(sendArgs.options?.deserializeExecutionSteps).toBe(deserializeExecutionSteps);

    // So the details are at that stage, deserialized by those deserializers
    expect(tx.processingStage).toBe('CompletedFinal');
    expect(tx.data).toEqual({ rawData: '' });
    expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toEqual([
      'Transfer',
    ]);
    expect(tx.processingSteps.executionSteps).toBeGreaterThan(0);
  });

  it('checks the args it sends with before it sends anything', async () => {
    const { signer, send } = createSpiedSigner();

    const badStage = await signer.safeExecuteTransaction({
      intent,
      minimalProcessingStage: 'Sent' as never,
    });
    assertNatErrKind(badStage, 'Signer.ExecuteTransaction.Args.InvalidSchema');

    const badPolicy = await signer.safeExecuteTransaction({
      intent,
      options: { transportPolicy: { rpc: { maxAttempts: 0 } } },
    });
    assertNatErrKind(badPolicy, 'Signer.ExecuteTransaction.Args.InvalidSchema');

    const badDeserializer = await signer.safeExecuteTransaction({
      intent,
      options: { deserializeResultData: 'not a function' as never },
    });
    assertNatErrKind(badDeserializer, 'Signer.ExecuteTransaction.Args.InvalidSchema');

    expect(send).not.toHaveBeenCalled();
  });
});
