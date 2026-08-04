import { expect } from 'vitest';
import {
  addFullAccessKey,
  createAccount,
  deployContract,
  functionCall,
  transfer,
} from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import { GAS_BURNER_FUNCTION_NAME, GAS_BURNER_WASM } from '../../../../../utils/wasm/gasBurner';
import type { TestContext } from './congestion.test';

const CONTRACT_ACCOUNT_ID = 'burner.nat';

// `max_total_prepaid_gas`, and with it the congestion every queued receipt is worth.
const PREPAID_TERA_GAS = '1000';

// `reject_tx_congestion_threshold` (0.8) of `max_congestion_incoming_gas` (400 Pgas) is
// 320 Pgas of delayed receipts, so at 1000 TGas apiece the queue has to hold 320 of them.
const CALLS_PER_ROUND = 400;
const ROUNDS = 12;

/**
 * The shard rejects new transactions while it works through a backlog of delayed receipts.
 *
 * Building that backlog needs receipts that are far more expensive to execute than to create:
 * a transaction converts for ~0.3 TGas while `burn` spends the whole 1000 TGas attached to it,
 * so a chunk (1 Pgas gas limit) drains one receipt while hundreds arrive. Everything queued
 * counts with its full prepaid gas, and once the queue passes the threshold
 * `congestion_control_accepts_transaction` turns down anything addressed to the shard.
 */
export const shardCongested = (context: TestContext) => async () => {
  const { client, defaultKeyPair, rpcUrl } = context;

  const natKey = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const deployTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: natKey.accountAccessKey.nonce + 1,
      blockHash: natKey.blockHash,
      actions: [
        createAccount(),
        transfer({ amount: { near: '50' } }),
        addFullAccessKey({ publicKey: defaultKeyPair.publicKey }),
        deployContract({ wasmBytes: GAS_BURNER_WASM }),
      ],
      receiverAccountId: CONTRACT_ACCOUNT_ID,
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: deployTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  let nonce = natKey.accountAccessKey.nonce + 2;

  const currentBlockHash = async () =>
    (
      await client.getAccountAccessKey({
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
      })
    ).blockHash;

  /**
   * The flood has to be fire-and-forget: `sendSignedTransaction` waits for the transaction to
   * be executed, and these transactions are queued behind the very backlog they create. So
   * they go straight to `send_tx` with `wait_until: NONE`, which is the one thing the client
   * doesn't expose.
   */
  const flood = async (blockHash: string) => {
    const transactions = await Promise.all(
      Array.from({ length: CALLS_PER_ROUND }, () =>
        signTransaction({
          signDataProvider: defaultKeyPair,
          transaction: {
            signerAccountId: 'nat',
            signerPublicKey: defaultKeyPair.publicKey,
            nonce: nonce++,
            blockHash,
            action: functionCall({
              functionName: GAS_BURNER_FUNCTION_NAME,
              gasLimit: { teraGas: PREPAID_TERA_GAS },
            }),
            receiverAccountId: CONTRACT_ACCOUNT_ID,
          },
        }),
      ),
    );

    await Promise.all(
      transactions.map(({ signedTransactionBorsh64 }) =>
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'flood',
            method: 'send_tx',
            params: { signed_tx_base64: signedTransactionBorsh64, wait_until: 'NONE' },
          }),
        }).catch(() => undefined),
      ),
    );
  };

  for (let round = 0; round < ROUNDS; round++) {
    const blockHash = await currentBlockHash();
    await flood(blockHash);
    await safeSleep(1000);

    const probe = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: nonce++,
        blockHash,
        action: transfer({ amount: { yoctoNear: '1' } }),
        receiverAccountId: 'alice',
      },
    });

    const tx = await client.safeSendSignedTransaction({ signedTransaction: probe });
    const cause = tx.ok ? undefined : (tx.error.context as { cause?: Error }).cause;

    if (cause?.message.includes('ShardCongested')) {
      assertUnmappedInvalidTxError(tx, {
        ShardCongested: {
          // The single shard of the sandbox, and whatever the queue has grown to.
          shardId: 0,
          congestionLevel: expect.any(Number),
        },
      });
      return;
    }
  }

  throw new Error(`The shard did not get congested after ${ROUNDS * CALLS_PER_ROUND} calls`);
};
