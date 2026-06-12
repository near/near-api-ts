import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySigner,
  deployContract,
  functionCall,
  near,
  transfer,
} from '../../../../../index';
import { toJsonBytes } from '../../../../../src/_common/utils/common';
import { safeSleep } from '../../../../../src/_common/utils/sleep';
import type { TransactionHash } from '../../../../../types/_common/common';
import type {
  DeserializeTransactionActionSummariesArgs,
  DeserializeTransactionExecutionStepsArgs,
  DeserializeTransactionResultDataArgs,
} from '../../../../../types/_common/transactionDetails/transactionResult';
import type { MemorySigner } from '../../../../../types/signers/memorySigner/memorySigner';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
import { createDefaultClient, getFileBytes, log } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('CallContractReadFunction', () => {
  let client: Client;
  let nat: MemorySigner;
  let transactionHash: TransactionHash;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);

    const keyService = createMemoryKeyService({
      keySource: { privateKey: DEFAULT_PRIVATE_KEY },
    });
    nat = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    const tx = await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          transfer({ amount: near('50') }),
          deployContract({
            wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
          }),
          functionCall({
            functionName: 'write_record',
            functionArgs: {
              record_id: 0,
              record: 'Hello',
            },
            gasLimit: { teraGas: '100' },
          }),
        ],
        receiverAccountId: 'c.nat',
      },
    });

    await safeSleep(500); // We can't use CompletedFinal yet
    transactionHash = tx.rawRpcResult.transaction.hash;

    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const tx = await client.getTransactionResult({
      transactionHash,
      options: {
        deserializeResultData: (args: DeserializeTransactionResultDataArgs) => args.data,
        deserializeActionSummaries: (
          args: DeserializeTransactionActionSummariesArgs,
        ): [number, string] => [args.rawActionSummaries.length, '123'],
      },
    });
    log(tx);

    if (tx.result.status === 'Success') {
      const d = tx.result.data;
    }

    const as = tx.processingSteps.conversionStep.transactionSummary.actionSummaries;
  });

  it('Default executionSteps - data is parsed and actionSummaries are converted', async () => {
    const tx = await client.getTransactionResult({ transactionHash });

    expect(tx.result.status).toBe('Success');

    const { executionSteps } = tx.processingSteps;
    expect(executionSteps).not.toBeNull();
    if (executionSteps === null) return;

    expect(executionSteps.length).toBeGreaterThan(0);

    for (const executionStep of executionSteps) {
      // Raw RPC actions are converted into default ActionSummaries;
      for (const actionSummary of executionStep.actionSummaries) {
        expect(actionSummary.actionType).toBeDefined();
      }
      // Raw base64 data is parsed - write_record returns nothing, so the data must be null;
      if (executionStep.result.status === 'Success') {
        expect(executionStep.result.data).toBeNull();
      }
    }
  });

  it('Custom deserializeExecutionSteps', async () => {
    const tx = await client.getTransactionResult({
      transactionHash,
      options: {
        deserializeExecutionSteps: (args: DeserializeTransactionExecutionStepsArgs) => {
          // Custom deserializer receives fully assembled steps with raw data and actionSummaries;
          for (const rawExecutionStep of args.rawExecutionSteps) {
            expect(typeof rawExecutionStep.executionStepId).toBe('string');
            if (rawExecutionStep.result.status === 'Success') {
              expect(typeof rawExecutionStep.result.data).toBe('string');
            }
          }
          return { stepsCount: args.rawExecutionSteps.length };
        },
      },
    });

    expect(tx.result.status).toBe('Success');
    if (tx.result.status !== 'Success') return;

    expect(tx.processingSteps.executionSteps).toEqual({ stepsCount: 1 });
  });

  it('Custom deserializeExecutionSteps throws', async () => {
    const tx = await client.safeGetTransactionResult({
      transactionHash,
      options: {
        deserializeExecutionSteps: () => {
          throw new Error('Boom');
        },
      },
    });

    assertNatErrKind(tx, 'Client.GetTransactionResult.DeserializeExecutionSteps.Failed');
  });

  it('ExecutionError - executionSteps are built', async () => {
    const signedTransaction = await nat.signTransaction({
      intent: {
        actions: [
          functionCall({
            functionName: 'non_existent_function',
            functionArgs: {},
            gasLimit: { teraGas: '30' },
          }),
        ],
        receiverAccountId: 'c.nat',
      },
    });

    // The transaction fails during execution, so we ignore the send error and
    // fetch the result by hash;
    await client.safeSendSignedTransaction({ signedTransaction });
    await safeSleep(500);

    const tx = await client.getTransactionResult({
      transactionHash: signedTransaction.transactionHash,
    });

    expect(tx.result.status).toBe('ExecutionError');

    const { executionSteps, refundSteps } = tx.processingSteps;
    expect(executionSteps).not.toBeNull();
    if (executionSteps === null) return;

    expect(executionSteps.length).toBeGreaterThan(0);
    expect(Array.isArray(refundSteps)).toBe(true);

    for (const executionStep of executionSteps) {
      for (const actionSummary of executionStep.actionSummaries) {
        expect(actionSummary.actionType).toBeDefined();
      }
    }
  });
});
