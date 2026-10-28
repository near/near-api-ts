import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addAccessKey,
  callContractFunction,
  createMemoryVault,
  createSigner,
  deployLocalContract,
  keyPair,
  near,
  randomEd25519KeyPair,
  transfer,
} from '../../index';
import { createSubAccount } from '../../src/transaction/actionCreators/createSubAccount';
import type { Client } from '../../types/client/client';
import type { Signer } from '../../types/signer/signer';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

describe('CallContractReadFunction', () => {
  let client: Client;
  let nat: Signer;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    const keyVault = createMemoryVault({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });

    nat = createSigner({
      signerAccountId: 'nat',
      client,
      keyVault,
    });

    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const tx = await nat.safeExecuteTransaction({
      intent: {
        actions: [
          createSubAccount(),
          transfer({ amount: near('50') }),
          // deployLocalContract({
          //   // wasmU8: await getFileBytes('./wasm/write-get-record.wasm'),
          //   wasmU8: Uint8Array.from([1, 2, 3, 4]),
          // }),
          callContractFunction({
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
