import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addFunctionCallKey,
  createMemoryKeyService,
  createMemorySigner,
  keyPair,
  near,
  randomEd25519KeyPair,
  signTransaction,
  transfer,
} from '../../index';
import type { Client } from '../../types/client/client';
import type { MemorySigner } from '../../types/signer/memorySigner';
import { createDefaultClient, log } from '../utils/common';
import { startMaliciousSandbox } from '../utils/sandbox/maliciousChunkProducer/startMaliciousSandbox';

// Requires the adversarial `neard-2_13_2-malicious` binary. `startMaliciousSandbox`
// boots it with ADVERSARY_SKIP_TX_VALIDATION and puts the chunk producer into
// `ProduceWithoutTxVerification` mode, so an invalid transaction is forced into
// the mempool, packed into a chunk, and recorded on chain as
// `Failure(InvalidTxError)` (the PV83 #14142 behavior) instead of being rejected
// by `send_tx`.
describe('invalid transaction included in a chunk', () => {
  let client: Client;
  let nat: MemorySigner;
  let rpcUrl: string;

  beforeAll(async () => {
    const sandbox = await startMaliciousSandbox();
    rpcUrl = sandbox.rpcUrl;
    client = createDefaultClient(sandbox);
    const keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });
    nat = createMemorySigner({ signerAccountId: 'nat', client, keyService });
    return () => sandbox.stop();
  });

  it('test invalidTxInChunk', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const kp = randomEd25519KeyPair();
    const kpd = keyPair(DEFAULT_PRIVATE_KEY);

    const signedTransaction = await signTransaction({
      signDataProvider: kpd,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: kpd.publicKey,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        action: transfer({ amount: { near: '200000' } }),
        receiverAccountId: 'bob123',
      },
    });

    const tx = await client.safeSendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'ExecutedNearlyFinal',
    });
    log(tx);

    const txDetails = await client.safeGetTransactionResult({
      transactionHash: signedTransaction.transactionHash,
    });
    log(txDetails);
  });
});
