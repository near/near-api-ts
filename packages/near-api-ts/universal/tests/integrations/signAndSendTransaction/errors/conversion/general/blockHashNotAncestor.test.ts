import { DEFAULT_PRIVATE_KEY, GenesisAccount, Sandbox } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createAccount,
  deployContract,
  functionCall,
  keyPair,
  transfer,
} from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { createDefaultClient } from '../../../../../utils/common';
import { GAS_BURNER_FUNCTION_NAME, GAS_BURNER_WASM } from '../../../../../utils/wasm/gasBurner';

const CONTRACT_ACCOUNT_ID = 'burner.nat';

// Five 1000 TGas receipts per chunk, so applying one takes about five seconds.
const CHUNK_GAS_LIMIT = 5_000_000_000_000_000;

// Kept far below the ~320 queued receipts that would congest the shard and mask the error
// under `ShardCongested`: the queue only has to stay non-empty, not grow.
const INITIAL_CALLS = 30;
const TOP_UP_CALLS = 12;
const TOP_UP_EVERY = 3;

const PROBE_ATTEMPTS = 20;

/**
 * The node rejects a transaction whose block is *newer* than the node's own head.
 *
 * `process_tx_internal` (`chain/client/src/rpc_handler.rs`) checks an incoming transaction
 * against `chain_store.head()`, and `validity_period_validate_is_ancestor` answers
 * `InvalidChain` as soon as the base block sits above that head — a higher block cannot be its
 * ancestor. (A block the node has never seen at all is `BlockHash.Expired` instead, one branch
 * earlier.)
 * On mainnet this is what a client gets when it takes a block hash from one RPC node and
 * submits the transaction to another one that is still catching up.
 *
 * The sandbox reproduces it by making the node lag behind itself. View queries — the ones that
 * hand out `blockHash` — are answered from the optimistic block of the next height, while the
 * head only moves once that block has been applied. Normally those are milliseconds apart, so
 * the chunk gas limit is raised to five 1000 TGas receipts and a queue of gas-burning calls is
 * kept non-empty: applying a chunk then takes seconds, and the window stays open long enough
 * for the transaction below to land inside it.
 */
describe('signAndSendTransaction › BlockHash.NotAncestor conversion error', () => {
  let client: Client;
  let rpcUrl: string;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await Sandbox.start({
      version: '2.13.2',
      config: {
        additionalAccounts: [
          GenesisAccount.createDefault('nat'),
          GenesisAccount.createDefault('alice'),
        ],
        additionalGenesis: { gas_limit: CHUNK_GAS_LIMIT },
      },
    });
    rpcUrl = sandbox.rpcUrl;
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with BlockHash.NotAncestor when the transaction block is ahead of the node head', {
    timeout: 180_000,
  }, async () => {
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

    /**
     * Fire and forget: waiting for these would mean waiting for the backlog they create,
     * and `wait_until: NONE` is the one thing the client doesn't expose.
     */
    const keepBusy = async (count: number) => {
      const calls = await Promise.all(
        Array.from({ length: count }, () =>
          signTransaction({
            signDataProvider: defaultKeyPair,
            transaction: {
              signerAccountId: 'nat',
              signerPublicKey: defaultKeyPair.publicKey,
              nonce: nonce++,
              blockHash: natKey.blockHash,
              action: functionCall({
                functionName: GAS_BURNER_FUNCTION_NAME,
                gasLimit: { teraGas: '1000' },
              }),
              receiverAccountId: CONTRACT_ACCOUNT_ID,
            },
          }),
        ),
      );

      await Promise.all(
        calls.map(({ signedTransactionBorsh64 }) =>
          fetch(rpcUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 'keep-busy',
              method: 'send_tx',
              params: { signed_tx_base64: signedTransactionBorsh64, wait_until: 'NONE' },
            }),
          }).catch(() => undefined),
        ),
      );
    };

    await keepBusy(INITIAL_CALLS);

    for (let attempt = 0; attempt < PROBE_ATTEMPTS; attempt++) {
      if (attempt > 0 && attempt % TOP_UP_EVERY === 0) await keepBusy(TOP_UP_CALLS);

      const { blockHash } = await client.getAccountAccessKey({
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
      });

      const signedTransaction = await signTransaction({
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

      const tx = await client.safeSendSignedTransaction({ signedTransaction });

      if (!tx.ok && tx.error.kind === 'Client.SendSignedTransaction.Rpc.BlockHash.NotAncestor') {
        expect(tx.error.context.info).toBe(null);
        return;
      }
    }

    throw new Error(
      `The head never lagged behind the queried block within ${PROBE_ATTEMPTS} attempts`,
    );
  });
});
