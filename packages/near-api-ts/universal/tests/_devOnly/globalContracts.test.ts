import { setTimeout as sleep } from 'node:timers/promises';
import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  functionCall,
  keyPair,
  linkGlobalContract,
  pinGlobalContract,
  registerGlobalContract,
  signTransaction,
} from '../../index';
import type { AccountId } from '../../types/_common/common';
import type { TransactionAction } from '../../types/_common/transaction/transaction';
import type { Client } from '../../types/client/client';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

/**
 * Happy path for the global contract actions.
 *
 * A global contract is wasm published to the chain on its own, detached from
 * any account: `RegisterGlobalContract` (nearcore `DeployGlobalContract`) puts
 * the code on chain and charges the registrar for its storage once, and
 * `PinGlobalContract` / `LinkGlobalContract` (both nearcore
 * `UseGlobalContract`) point an account at that already-stored code instead of
 * carrying a wasm copy of its own - by wasm hash and by registrar account id
 * respectively.
 *
 * Two things worth knowing while reading this test:
 *
 * - All of them require `signerAccountId === receiverAccountId` (nearcore
 *   `check_actor_permissions`), so every transaction below is self-addressed.
 * - Registering does not publish the code synchronously. The action only emits
 *   a `GlobalContractDistribution` receipt, which nearcore then walks across
 *   every shard. That receipt produces no execution outcome, so `wait_until`
 *   does not cover it - the code becomes usable a block or so after the
 *   register transaction reports success, which is what
 *   `waitForGlobalContractCode` below polls for.
 *
 * Transactions are sent over raw JSON-RPC rather than through
 * `client.sendSignedTransaction`, because the transaction details layer does
 * not know these two actions yet.
 */
describe('Global contracts', () => {
  let client: Client;
  let rpcUrl: string;
  let wasmU8: Uint8Array;
  let wasmHash: string;
  const kp = keyPair(DEFAULT_PRIVATE_KEY);

  const callRpc = async (method: string, params: unknown) => {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'globalContracts', method, params }),
    });
    // biome-ignore lint/suspicious/noExplicitAny: raw RPC payload, this test inspects it by hand
    return (await response.json()) as { result?: any; error?: unknown };
  };

  const executeAction = async (accountId: AccountId, action: TransactionAction) => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId,
      publicKey: kp.publicKey,
    });

    const { signedTransactionBorsh64 } = await signTransaction({
      signDataProvider: kp,
      transaction: {
        signerAccountId: accountId,
        signerPublicKey: kp.publicKey,
        receiverAccountId: accountId,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        action,
      },
    });

    const { result, error } = await callRpc('send_tx', {
      signed_tx_base64: signedTransactionBorsh64,
      wait_until: 'EXECUTED',
    });

    if (error) throw new Error(`send_tx failed: ${JSON.stringify(error)}`);
    expect(result.status).toHaveProperty('SuccessValue');
    return result;
  };

  // Polls until the distribution receipt has stored the code under its identifier.
  const waitForGlobalContractCode = async (request: Record<string, string>) => {
    for (let attempt = 0; attempt < 40; attempt++) {
      const { result } = await callRpc('query', { ...request, finality: 'optimistic' });
      if (result?.code_base64) return result;
      await sleep(250);
    }
    throw new Error(`Global contract was not distributed in time: ${JSON.stringify(request)}`);
  };

  beforeAll(async () => {
    const sandbox = await startSandbox();
    rpcUrl = sandbox.rpcUrl;
    client = createDefaultClient(sandbox);
    wasmU8 = await getFileBytes('./wasm/write-get-record.wasm');
    // An immutable contract is addressed by the sha256 of the wasm itself -
    // nearcore never hands that hash back, the caller derives it.
    wasmHash = base58.encode(sha256(wasmU8));

    return () => sandbox.stop();
  });

  it('registered as immutable - pinned by the code hash', async () => {
    const registerResult = await executeAction(
      'nat',
      registerGlobalContract({ wasmU8, wasmMutability: 'Immutable' }),
    );
    log(registerResult);

    await waitForGlobalContractCode({
      request_type: 'view_global_contract_code',
      code_hash: wasmHash,
    });

    const useResult = await executeAction(
      'alice',
      pinGlobalContract({ globalContractWasmHash: wasmHash }),
    );
    log(useResult);

    const alice = await client.getAccountInfo({ accountId: 'alice' });
    log(alice);
    // The account runs the global code without holding a local copy of it.
    expect(alice.contractWasmHash).toBe(null);
    expect(alice.globalContractWasmHash).toBe(wasmHash);
    expect(alice.globalContractAccountId).toBe(null);

    await executeAction(
      'alice',
      functionCall({
        functionName: 'write_record',
        functionArgs: { record_id: 0, record: 'Hello from a global contract' },
        gasLimit: { teraGas: '100' },
      }),
    );

    const record = await client.callContractReadFunction({
      contractAccountId: 'alice',
      functionName: 'get_record',
      functionArgs: { record_id: 0 },
    });
    expect(record.result).toBe('Hello from a global contract');
  });

  it('registered as mutable - linked to the registrar account', async () => {
    const registerResult = await executeAction(
      'nat',
      registerGlobalContract({ wasmU8, wasmMutability: 'Mutable' }),
    );
    log(registerResult);

    await waitForGlobalContractCode({
      request_type: 'view_global_contract_code_by_account_id',
      account_id: 'nat',
    });

    const useResult = await executeAction(
      'bob',
      linkGlobalContract({ globalContractAccountId: 'nat' }),
    );
    log(useResult);

    const bob = await client.getAccountInfo({ accountId: 'bob' });
    log(bob);
    expect(bob.contractWasmHash).toBe(null);
    expect(bob.globalContractWasmHash).toBe(null);
    expect(bob.globalContractAccountId).toBe('nat');

    await executeAction(
      'bob',
      functionCall({
        functionName: 'write_record',
        functionArgs: { record_id: 0, record: 'Hello from nat`s global contract' },
        gasLimit: { teraGas: '100' },
      }),
    );

    const record = await client.callContractReadFunction({
      contractAccountId: 'bob',
      functionName: 'get_record',
      functionArgs: { record_id: 0 },
    });
    expect(record.result).toBe('Hello from nat`s global contract');
  });
});
