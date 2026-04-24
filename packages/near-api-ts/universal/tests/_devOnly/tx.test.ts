import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createAccount,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  deployContract,
  functionCall,
  transfer,
} from '../../index';
import { SignedTransactionSchema } from '../../src/_common/schemas/zod/transaction/transaction';
import { toBorshSignedTransaction } from '../../src/_common/transformers/toBorshBytes/transaction';
import { safeSleep } from '../../src/_common/utils/sleep';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60 * 60 * 1000 });

describe('Get Detailed Transaction', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Test', async () => {
    const keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });

    let nat = createMemorySigner({
      signerAccountId: 'nat',
      keyService,
      client,
    });

    // Create contract
    await nat.safeExecuteTransaction({
      intent: {
        actions: [
          createAccount(),
          transfer({ amount: { near: '10' } }),
          addFullAccessKey({ publicKey: DEFAULT_PUBLIC_KEY }),
          deployContract({
            wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
          }),
        ],
        receiverAccountId: 'contract.nat',
      },
    });
    await safeSleep(1000);

    // Do some action
    nat = createMemorySigner({
      signerAccountId: 'nat',
      keyService,
      client,
    });


    // const signedTransaction = await nat.signTransaction({
    //   intent: {
    //     action: {
    //       actionType: 'Transfer',
    //       amount: { yoctoNear: '130' },
    //       // amount: { near: '1230000000000000' },
    //     },
    //     receiverAccountId: 'test.near',
    //   },
    // });
    const signedTransaction = await nat.signTransaction({
      intent: {
        action: functionCall({
          functionName: 'write_record',
          functionArgs: {
            record_id: 0,
            record: 'Hello',
          },
          gasLimit: { teraGas: '100' },
        }),
        receiverAccountId: 'contract.nat',
      },
    });

    // log(signedTransaction);

    await client.safeSendSignedTransaction({
      signedTransaction,
    })


    // Get Tx
    // await safeSleep(375);

    const r = await fetch('http://localhost:4560', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'EXPERIMENTAL_tx_status',
        params: {
          tx_hash: signedTransaction.transactionHash,
          sender_account_id: 'any',
          wait_until: 'INCLUDED_FINAL',
        },
      }),
    });
    const json = await r.json();

    log(json);
  });
});
