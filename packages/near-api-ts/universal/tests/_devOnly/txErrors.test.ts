import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addFullAccessKey,
  createMemoryKeyService,
  createMemorySigner,
  createMemorySignerFactory,
  deployContract,
  functionCall,
  keyPair,
  near,
  randomEd25519KeyPair,
  transfer,
} from '../../index';
import { createAccount } from '../../src/helpers/actionCreators/createAccount';
import type { Client } from '../../types/client/client';
import type { MemorySigner } from '../../types/signers/memorySigner/memorySigner';
import type { MemorySignerFactory } from '../../types/signers/memorySigner/public/createMemorySigner';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

describe('CallContractReadFunction', () => {
  let client: Client;
  let nat: MemorySigner;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    const keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });

    nat = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const tx = await nat.safeExecuteTransaction({
      intent: {
        actions: [
          createAccount(),
          transfer({ amount: near('50') }),
          // deployContract({
          //   // wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
          //   wasmBytes: Uint8Array.from([1, 2, 3, 4]),
          // }),
          functionCall({
            functionName: 'write_record1',
            functionArgs: {
              record_id: 0,
              record: 'Hello',
            },
            gasLimit: { teraGas: '100' },
          }),
        ],
        // receiverAccountId: '8a3a2af86f8b2a0d013761565dc6ee86af153f6fa4c7db4bd9a52f63ff072d4c',
        receiverAccountId: '0s0123456789012345678901234567890123456789',
      },
    });

    log(tx);
  });
});
