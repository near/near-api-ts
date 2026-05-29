import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createClient,
  createMainnetClient,
  createMemoryKeyService,
  createMemorySigner,
  createTestnetClient,
  type MemoryKeyService,
  transfer,
} from '../../index';
import { safeSleep } from '../../src/_common/utils/sleep';
import { assertNatErrKind } from '../utils/assertNatErrKind';
import { createDefaultClient, log } from '../utils/common';
import { startShardedSandbox } from '../utils/sandbox/sharded/startShardedSandbox';
import { startSandbox } from '../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });
z.config(z.locales.en());

describe('getTransactionResult', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('simple tx', async () => {
    // const keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });
    //
    // const alice = createMemorySigner({
    //   signerAccountId: 'alice',
    //   client,
    //   keyService,
    // });
    //
    // const signedTransaction = await alice.signTransaction({
    //   intent: {
    //     action: transfer({ amount: { near: '1' } }),
    //     receiverAccountId: 'nat',
    //   },
    // });
    //
    // client.sendSignedTransaction({ signedTransaction });
    //
    // await safeSleep(1000);


    // const testnetClient = createTestnetClient();
    //
    // const txResult = await testnetClient.safeGetTransactionResult({
    //   // transactionHash: 'GMhxbrMZ4PAprLdwb9wyJ627kVRBWKK6yvfCTL8Mf5Fs',  // DelegateActionInvalidNonce
    //   // transactionHash: '3AByi9aq9KukKZRGSEVhkffk7Vjb2rpBKcf5daUdrKDY', // request - not SIR
    //   transactionHash: '3QMHh2yBHBGrkcxQtPfx9npCnJsHaXTMcTTwmM4SbKSw', // sign (mpc) - not SIR
    //   // transactionHash: '33GmSjm2uudAknXkShLhE1idNd6FePWnKBT7Mqb6CA5b', local receipt
    //   policies: { transport: { rpcTypePreferences: ['Archival', 'Regular'] } },
    // });
    //
    // log(txResult);

    const mainnetClient = createMainnetClient()

    const mainnetTxResult = await mainnetClient.safeGetTransactionResult({
      // transactionHash: 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe', // execute_intents - SIR
      // transactionHash: 'GxFGnomJ8znxJkpSduxZk7c9F3nqh7waAvnWxdFfxshK', // v1.signer - respond - not SIR
      transactionHash: 'DSnehcspPKHuX44brwy4gWDhJYBaKwcP21Hq4qqjncE1', // wrap.near - ft_transfer_call - not SIR
      policies: { transport: { rpcTypePreferences: ['Archival', 'Regular'] } },
    });

    log(mainnetTxResult);
  });
});
