import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import { deserialize, type Schema, serialize } from 'borsh';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type AccountId, type Client, keyPair, verifySignature } from '../../index';
import { DelegateActionActionBorshSchema } from '../../src/_common/schemas/borsh/actions/delegate';
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

const signDelegation = (senderId: AccountId, deposit: bigint) => {
  const delegateAction = {
    tag: 1073742190, // (1 << 30) + 366,
    senderId,
    receiverId: 'bob123',
    actions: [{ transfer: { deposit } }],
    nonce: 5n,
    maxBlockHeight: 100n,
    publicKey: { ed25519Key: { data: kp.publicKeyU8 } },
  };

  const delegateActionBorsh = serialize(schema, delegateAction);

  const delegateActionHashU8 = sha256(delegateActionBorsh);
  const { u8Signature } = kp.sign(delegateActionHashU8);

  return {
    delegate: {
      delegateAction,
      signature: { ed25519Signature: { data: u8Signature } },
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
    console.log('relay balance before:', balanceBefore.accountInfo.balance.total.near )

    const aliceBalanceBefore = await client.getAccountInfo({ accountId: 'alice' });
    console.log('alice balance before:', aliceBalanceBefore.accountInfo.balance.total.near )

    // actions: [signDelegation('alice', 100n), { transfer: { deposit: 200n } }],

    const transaction = {
      signerId: 'relay',
      publicKey: { ed25519Key: { data: relayKp.publicKeyU8 } },
      nonce: BigInt(accountAccessKey.nonce + 1),
      receiverId: 'alice',
      blockHash: base58.decode(blockHash),
      actions: [signDelegation('alice', 500000000000000000000000000n)], // 500 NEAR
    };

    const transactionBorsh = serialize(TransactionBorshSchema, transaction);
    const transactionHashU8 = sha256(transactionBorsh);
    const { u8Signature } = relayKp.sign(transactionHashU8);

    const signedTransaction = {
      transaction,
      signature: { ed25519Signature: { data: u8Signature } },
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
    console.log('relay balance after:', balanceAfter.accountInfo.balance.total.near )

    const aliceBalanceAfter = await client.getAccountInfo({ accountId: 'alice' });
    console.log('alice balance after:', aliceBalanceAfter.accountInfo.balance.total.near )
  });
});
