import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addFullAccessKey,
  createMemoryKeyService,
  createMemorySigner,
  createMemorySignerFactory,
  deployContract,
  functionCall,
  near,
  randomEd25519KeyPair,
  transfer,
} from '../../index';
import { createAccount } from '../../src/helpers/actionCreators/createAccount';
import type { Client } from '../../types/client/client';
import type { MemorySigner } from '../../types/signers/memorySigner/memorySigner';
import type { MemorySignerFactory } from '../../types/signers/memorySigner/public/createMemorySigner';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

describe('CallContractReadFunction', () => {
  let client: Client;
  let nat: MemorySigner;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    const keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });

    nat = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const tx = await nat.safeExecuteTransaction({
      intent: {
        actions: [
          createAccount(),
          transfer({ amount: near('50') }),
          // deployContract({
          //   // wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
          //   wasmBytes: Uint8Array.from([1, 2, 3, 4]),
          // }),
          functionCall({
            functionName: 'write_record1',
            functionArgs: {
              record_id: 0,
              record: 'Hello',
            },
            gasLimit: { teraGas: '100' },
          }),
        ],
        receiverAccountId: 'c.nat',
      },
    });

    log(tx);
  });
});

// Reproduces ActionErrorKind::LackBalanceForState (the action-level variant produced in a
// receipt at runtime/runtime/src/lib.rs, NOT the tx-validation InvalidTxError variant).
//
// We create a fresh sub-account, fund it with a tiny amount, and deploy an ~83 KB contract
// in the same receipt. Every action succeeds, but the post-execution check_storage_stake on
// the new account fails because the deposited balance can't cover the contract's storage
// (~0.84 NEAR at the default storage_amount_per_byte of 1e19 yocto/byte).
describe('LackBalanceForState', () => {
  let client: Client;
  let nat: MemorySigner;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    const keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });

    nat = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    return () => sandbox.stop();
  });

  it('ActionError', async () => {
    const tx = await nat.safeExecuteTransaction({
      intent: {
        actions: [
          createAccount(),
          // Far less than the ~0.84 NEAR the deployed contract needs for storage.
          transfer({ amount: near('0.1') }),
          deployContract({
            wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
          }),
        ],
        receiverAccountId: 'lack.nat',
      },
    });

    log(tx);
  });
});

// Reproduces InvalidTxError::LackBalanceForState (the tx-VALIDATION variant produced in
// runtime/runtime/src/verifier.rs, NOT the action-level ActionErrorKind variant above).
//
// The signer must PASS the NotEnoughBalance check (balance >= total_cost) but, after debiting
// total_cost (deposit + fees), be left below its own storage requirement:
//   balance >= total_cost  AND  balance - total_cost < storage_cost
//
// We give a fresh sub-account 1 NEAR with 10 full-access keys (storage ~0.0092 NEAR ⇒
// available ~0.9908). Then that account signs a transfer of 0.995 NEAR: total_cost ≈ 0.995 <= 1
// (passes NotEnoughBalance), but 1 - 0.995 = 0.005 < 0.0092 ⇒ LackBalanceForState.
describe('InvalidTxLackBalanceForState', () => {
  let client: Client;
  let createSigner: MemorySignerFactory;
  // Key the poor sub-account will sign with; must live in the shared key service.
  const poorKeyPair = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    const keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }, poorKeyPair],
    });
    createSigner = createMemorySignerFactory({ client, keyService });

    return () => sandbox.stop();
  });

  it('InvalidTxError', async () => {
    const nat = createSigner('nat');

    // Create poor.nat with exactly 1 NEAR and 10 FA keys to inflate its storage cost (~0.0092
    // NEAR), widening the LackBalanceForState window.
    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          addFullAccessKey(poorKeyPair),
          ...Array(9)
            .fill(0)
            .map(() => addFullAccessKey(randomEd25519KeyPair())),
          transfer({ amount: near('1') }),
        ],
        receiverAccountId: 'poor.nat',
      },
    });

    const poor = createSigner('poor.nat');

    // 0.995 is above available (~0.9908) but below the full balance ⇒ tx is "affordable" yet
    // leaves the signer unable to cover its storage.
    const tx = await poor.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: near('0.995') }),
        receiverAccountId: 'nat',
      },
    });

    log(tx);
  });
});
