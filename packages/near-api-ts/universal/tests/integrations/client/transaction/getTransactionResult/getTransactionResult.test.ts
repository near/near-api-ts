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
  DeserializeTransactionResultDataArgs,
} from '../../../../../types/_common/transactionDetails/transactionResult';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
import { createDefaultClient, getFileBytes, log } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('CallContractReadFunction', () => {
  let client: Client;
  let transactionHash: TransactionHash;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);

    const keyService = createMemoryKeyService({
      keySource: { privateKey: DEFAULT_PRIVATE_KEY },
    });
    const nat = createMemorySigner({
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
});
