import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  type Client,
  type MemoryKeyService,
  transfer,
  createAccount,
  addFullAccessKey,
  deployContract,
  functionCall,
} from '../../../../index';
import { createDefaultClient, getFileBytes, log } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { testKeys } from '../../../utils/testKeys';

vi.setConfig({ testTimeout: 60000 });

describe('Transaction success', () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: testKeys.fc.forContract.privateKey },
      ],
    });
    return () => sandbox.stop();
  });

  it('Create contract', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await keyService.signTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        actions: [
          createAccount(),
          transfer({ amount: { near: '100' } }),
          addFullAccessKey({ publicKey: DEFAULT_PUBLIC_KEY }),
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
        receiverAccountId: 'contract.nat',
      },
    });

    const tx1 = await client.safeSendSignedTransaction({ signedTransaction });
    log(tx1);
  });
});
