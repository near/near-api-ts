import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  callContractFunction,
  convertBase64ToObject,
  createMemoryVault,
  createSigner,
  createSubAccount,
  createVaultSignService,
  deployLocalContract,
  type GetTransactionResultDeserializeActionSummariesArgs,
  type GetTransactionResultDeserializeExecutionStepsArgs,
  type GetTransactionResultDeserializeResultDataArgs,
  near,
  transfer,
} from '../../../../../index';
import { safeSleep } from '../../../../../src/createClient/createTransport/createSendRequest/_common/_common/sleep';
import type { Base64String, TransactionHash } from '../../../../../types/_common/common';
import type { TransactionActionSummary } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import type { ExecutionStep } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';
import type { Signer } from '../../../../../types/signer/signer';
import { createDefaultClient, getFileBytes, log } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

const WriteRecordArgsZodSchema = z.object({
  record_id: z.number(),
  record: z.string(),
});

describe('CallContractReadFunction', () => {
  let client: Client;
  let nat: Signer;
  let transactionHash: TransactionHash;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);

    const keyVault = createMemoryVault({
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
    });

    const tx = await nat.executeTransaction({
      intent: {
        actions: [
          createSubAccount(),
          transfer({ amount: near('50') }),
          deployLocalContract({
            wasmU8: await getFileBytes('./wasm/write-get-record.wasm'),
          }),
          callContractFunction({
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
    transactionHash = tx.transactionHash;

    return () => sandbox.stop();
  });

  it('Ok', async () => {
    // Just return some parsed result
    const deserializeResultData = (args: GetTransactionResultDeserializeResultDataArgs) =>
      convertBase64ToObject(args.rawData);

    // We can validate that we called a write_record method with a valid WriteRecordArgs type functionArgs;
    const deserializeActionSummaries = (
      args: GetTransactionResultDeserializeActionSummariesArgs,
    ): TransactionActionSummary<
      'Live' | 'Legacy',
      { record_id: number; record: string } | Base64String
    >[] =>
      args.rawActionSummaries.map((rawActionSummary) => {
        if (
          rawActionSummary.actionType === 'CallContractFunction' &&
          rawActionSummary.functionName === 'write_record'
        ) {
          return {
            ...rawActionSummary,
            functionArgs: WriteRecordArgsZodSchema.parse(
              convertBase64ToObject(rawActionSummary.functionArgs),
            ),
          };
        }
        return rawActionSummary;
      });

    // Just show parsed result
    const deserializeExecutionSteps = (
      args: GetTransactionResultDeserializeExecutionStepsArgs,
    ): ExecutionStep<
      'Live' | 'Legacy',
      unknown,
      TransactionActionSummary<
        'Live' | 'Legacy',
        { record_id: number; record: string } | Base64String
      >[]
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
        deserializeResultData,
        deserializeActionSummaries,
        deserializeExecutionSteps,
      },
    });
    log(tx);

    if (tx.status === 'ExecutionSuccess') {
      const d = tx.data;
      const as = tx.processingSteps.conversionStep.transactionSummary.actionSummaries;
      const es = tx.processingSteps.executionSteps;
      const rf = tx.processingSteps.refundSteps;
    }
  });
});
