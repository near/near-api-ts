import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import { type Schema, serialize } from 'borsh';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type AccountId, type Client, keyPair} from '../../index';
import { DelegateActionBorshSchema } from '../../src/_common/schemas/borsh/delegateAction';
import {
  SignedTransactionBorshSchema,
  TransactionBorshSchema,
} from '../../src/_common/schemas/borsh/transaction';
import { createDefaultClient, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

const kp = keyPair(DEFAULT_PRIVATE_KEY);

const schema: Schema = {
  struct: {
    tag: 'u32',
    ...(DelegateActionBorshSchema as any).struct,
  },
};

const signDelegation = async (senderId: AccountId, deposit: bigint) => {
  const delegation = {
    tag: 1073742190, // (1 << 30) + 366,
    senderId,
    receiverId: 'bob123',
    actions: [{ transfer: { deposit } }],
    nonce: 5n,
    maxBlockHeight: 100n,
    publicKey: { ed25519Key: { data: kp.publicKeyU8 } },
  };

  const delegateActionBorsh = serialize(schema, delegation);

  const delegateActionHashU8 = sha256(delegateActionBorsh);
  const { signatureU8 } = await kp.signData({ dataU8: delegateActionHashU8 });

  return {
    delegate: {
      delegateAction: delegation,
      signature: { ed25519Signature: { data: signatureU8 } },
    },
  };
};

describe('Full-scale delegation test', async () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('test', async () => {
    const relayKp = keyPair(
      'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6',
    );

    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'relay',
      publicKey: relayKp.publicKey,
    });

    const balanceBefore = await client.getAccountInfo({ accountId: 'relay' });
    console.log('relay balance before:', balanceBefore.balance.total.near);

    const aliceBalanceBefore = await client.getAccountInfo({ accountId: 'alice' });
    console.log('alice balance before:', aliceBalanceBefore.balance.total.near);

    // actions: [signDelegation('alice', 100n), { transfer: { deposit: 200n } }],

    const transaction = {
      signerId: 'relay',
      publicKey: { ed25519Key: { data: relayKp.publicKeyU8 } },
      nonce: BigInt(accountAccessKey.nonce + 1),
      receiverId: 'alice',
      blockHash: base58.decode(blockHash),
      actions: [await signDelegation('alice', 500000000000000000000000000n)], // 500 NEAR
    };

    const transactionBorsh = serialize(TransactionBorshSchema, transaction);
    const transactionHashU8 = sha256(transactionBorsh);
    const { signatureU8 } = await relayKp.signData({ dataU8: transactionHashU8 });

    const signedTransaction = {
      transaction,
      signature: { ed25519Signature: { data: signatureU8 } },
    };

    const signedTransactionBorsh64 = serialize(
      SignedTransactionBorshSchema,
      signedTransaction,
    ).toBase64();

    // # Send Signed Transaction
    const response = await fetch('http://localhost:4560', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'send_tx',
        params: {
          signed_tx_base64: signedTransactionBorsh64,
          wait_until: 'FINAL',
        },
      }),
    });
    const json = await response.json();

    log(json);

    const balanceAfter = await client.getAccountInfo({ accountId: 'relay' });
    console.log('relay balance after:', balanceAfter.balance.total.near);

    const aliceBalanceAfter = await client.getAccountInfo({ accountId: 'alice' });
    console.log('alice balance after:', aliceBalanceAfter.balance.total.near);
  });
});
