import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  deployContract,
  functionCall,
  type MemoryKeyService,
  transfer,
} from '../../../../index';
import { signTransaction } from '../../../../src/transaction/signTransaction/signTransaction';
import { createDefaultClient, getFileBytes, log } from '../../../utils/common';
import { getLastNonce } from '../../../utils/getLastNonce';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { testKeys } from '../../../utils/testKeys';

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
    const natAccessKey = await client.getAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: keyService,
      transaction: {
        signer: {
          accountId: 'nat',
          publicKey: DEFAULT_PUBLIC_KEY,
          replayProtection: {
            scheme: 'NonceChannel',
            nonce: getLastNonce(natAccessKey.accessKey) + 1,
          },
        },
        recentBlockHash: natAccessKey.atMomentOf.blockHash,
        actions: [
          createAccount(),
          transfer({ amount: { near: '100' } }),
          addAccessKey({
            publicKey: DEFAULT_PUBLIC_KEY,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'AccountBalance' },
          }),
          deployContract({
            wasmU8: await getFileBytes('./wasm/write-get-record.wasm'),
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
