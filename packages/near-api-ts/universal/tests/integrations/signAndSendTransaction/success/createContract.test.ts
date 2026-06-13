import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  deployContract,
  functionCall,
  type MemoryKeyService,
  transfer,
} from '../../../../index';
import { signTransaction } from '../../../../src/helpers/signTransaction';
import { createDefaultClient, getFileBytes, log } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { testKeys } from '../../../utils/testKeys';

vi.setConfig({ testTimeout: 60000 });

describe('safeSendSignedTransaction › success', () => {
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

  it('creates, funds, and deploys a contract in one transaction', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: keyService,
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
