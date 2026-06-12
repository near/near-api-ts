import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySigner,
  deployContract,
  fromJsonBytes,
  functionCall,
  near,
  transfer,
} from '../../../../../index';
import { toJsonBytes } from '../../../../../src/_common/utils/common';
import { safeSleep } from '../../../../../src/_common/utils/sleep';
import { deserializeExecutionSteps } from '../../../../../src/client/methods/transaction/getTransactionResult/handleRpcResult/getTransactionResultOutput/getProcessingSteps/getNonConversionSteps/deserializeExecutionSteps';
import type { Base64String, TransactionHash } from '../../../../../types/_common/common';
import type { ActionSummary } from '../../../../../types/_common/transactionDetails/actionSummaries';
import type { ExecutionStep } from '../../../../../types/_common/transactionDetails/processingSteps/executionStep';
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

const WriteRecordArgsZodShema = z.object({
  record_id: z.number(),
  record: z.string(),
});

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
    // Just return some parsed result
    const deserializeResultData = (args: DeserializeTransactionResultDataArgs) =>
      fromJsonBytes(Uint8Array.fromBase64(args.rawData));

    // We can validate that we called a write_record method with a valid WriteRecordArgs type functionArgs;
    const deserializeActionSummaries = (
      args: DeserializeTransactionActionSummariesArgs,
    ): ActionSummary<{ record_id: number; record: string } | Base64String>[] =>
      args.rawActionSummaries.map((rawActionSummary) => {
        if (
          rawActionSummary.actionType === 'FunctionCall' &&
          rawActionSummary.functionName === 'write_record'
        ) {
          return {
            ...rawActionSummary,
            functionArgs: WriteRecordArgsZodShema.parse(
              fromJsonBytes(Uint8Array.fromBase64(rawActionSummary.functionArgs)),
            ),
          };
        }
        return rawActionSummary;
      });

    // Just show parsed result
    const deserializeExecutionSteps = (
      args: DeserializeTransactionExecutionStepsArgs,
    ): ExecutionStep<
      unknown,
      ActionSummary<{ record_id: number; record: string } | Base64String>[]
    >[] =>
      args.rawExecutionSteps.map((rawExecutionStep) => ({
        ...rawExecutionStep,
        result:
          rawExecutionStep.result.status === 'Success'
            ? {
                status: rawExecutionStep.result.status,
                data: deserializeResultData({ rawData: rawExecutionStep.result.data }),
              }
            : rawExecutionStep.result,
        actionSummaries: deserializeActionSummaries({
          rawActionSummaries: rawExecutionStep.actionSummaries,
        }),
      }));

    const tx = await client.getTransactionResult({
      transactionHash,
      options: {
        // deserializeResultData,
        deserializeActionSummaries,
        deserializeExecutionSteps,
      },
    });
    log(tx);

    if (tx.result.status === 'Success') {
      const d = tx.result.data;
    }

    const as = tx.processingSteps.conversionStep.transactionSummary.actionSummaries;
    const es = tx.processingSteps.executionSteps;
  });
});
