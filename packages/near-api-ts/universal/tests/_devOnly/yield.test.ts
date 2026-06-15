import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import * as z from 'zod/mini';
import {
  addFullAccessKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySigner,
  createTestnetClient,
  deployContract,
  functionCall,
  randomEd25519KeyPair,
  transfer,
} from '../../index';
import { safeSleep } from '../../src/_common/utils/sleep';
import {
  executeTransaction
} from '../../src/signers/memorySigner/tasker/executeTask/executors/executeTransaction';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('yield contract', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('test', async () => {
    const testnetClient = createTestnetClient()

    const keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });

    const nat = createMemorySigner({
      signerAccountId: 'nat',
      keyService,
      client,
    });

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '10000000000000' } }),
        receiverAccountId: 'yield.nat',
      },
    });
    log(res)
    // // #1: Create yield contract
    // await nat.executeTransaction({
    //   intent: {
    //     actions: [
    //       createAccount(),
    //       transfer({ amount: { near: '100' } }),
    //       addFullAccessKey({ publicKey: DEFAULT_PUBLIC_KEY }),
    //       deployContract({
    //         wasmBytes: await getFileBytes('./wasm/pause_continue.wasm'),
    //       }),
    //     ],
    //     receiverAccountId: 'yield.nat',
    //   },
    // });
    //
    // await safeSleep(2000);
    //
    // // #2: Add request
    //
    // const res = await nat.executeTransaction({
    //   intent: {
    //     action: functionCall({
    //       functionName: 'request',
    //       functionArgs: {
    //         prompt: 'Some request',
    //       },
    //       gasLimit: { teraGas: '100' },
    //     }),
    //     receiverAccountId: 'yield.nat',
    //   },
    // });
    // log(res);
  });
});

/*
const client = {
  fireAndForgetTransaction,
  // fireAndValidateTransaction, // INCLUDED_OPTIMISTIC / INCLUDED_FINAL
  includeTransaction, // INCLUDED_OPTIMISTIC / INCLUDED_FINAL
  waitForExecutionResult
};
const signer = {
  submitTransaction,
  executeTransaction
};

const submittedTransactionWithValidationError = await signer.submitTransaction({ transfer: { near: 10 } }); // 600ms

// MUST HANDLE: invalid nonce (re-sign), timeout error (re-submit until included)
// { signedTransaction, signedTransactionHash, status: SUCCESS }
// { signedTransaction, signedTransactionHash, status: { ERROR: INVALID_TRANSACTION } }

function submitTransaction(tx) {
  while (nonce is invalid) {
    await client.fireAndValidateTransaction(tx)
  }
}

function executeTransaction() {
  const { signedTransaction } = await this.submitTransaction();
  await client.waitForExecutionResult({ signedTransaction })
}

showToUser("Transaction <txHash> is in progress");

// in background
await client.waitForExecutionResult({ signedTransaction })
 */
