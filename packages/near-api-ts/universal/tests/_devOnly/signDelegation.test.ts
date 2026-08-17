import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair, signTransaction, transfer } from '../../index';
import {
  safeSignDelegation,
  signDelegation,
} from '../../src/createMemorySignService/signDelegation/signDelegation';
import { createDefaultClient, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

const kp = keyPair(DEFAULT_PRIVATE_KEY);

describe('Full-scale delegation test', async () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox({ rpcPort: 4560 });
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

    const signedDelegation = await safeSignDelegation({
      delegation: {
        senderAccountId: 'alice', // TODO delegatorAccountId
        senderPublicKey: kp.publicKey,
        delegatedAction: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
        nonce: 2,
        expireAt: { blockHeight: 1000 },
      },
      signDataProvider: kp,
    });

    log(signedDelegation);

    return;

    const signedTransaction = await signTransaction({
      transaction: {
        signerAccountId: 'relay',
        signerPublicKey: relayKp.publicKey,
        nonce: accountAccessKey.nonce + 1,
        action: {
          actionType: 'ExecuteDelegation',
          delegation: signedDelegation.delegation,
          signature: signedDelegation.signature,
        },
        receiverAccountId: signedDelegation.delegation.senderAccountId,
        blockHash,
      },
      signDataProvider: relayKp,
    });

    const txRes = await client.sendSignedTransaction({ signedTransaction });
    log(txRes);

    // const transactionBorsh = serialize(TransactionBorshSchema, transaction);
    // const transactionHashU8 = sha256(transactionBorsh);
    // const { signatureU8 } = await relayKp.signData({ dataU8: transactionHashU8 });
    //
    // const signedTransaction = {
    //   transaction,
    //   signature: { ed25519Signature: { data: signatureU8 } },
    // };
    //
    // const signedTransactionBorsh64 = serialize(
    //   SignedTransactionBorshSchema,
    //   signedTransaction,
    // ).toBase64();
    //
    // // # Send Signed Transaction
    // const response = await fetch('http://localhost:4560', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     jsonrpc: '2.0',
    //     id: 0,
    //     method: 'send_tx',
    //     params: {
    //       signed_tx_base64: signedTransactionBorsh64,
    //       wait_until: 'FINAL',
    //     },
    //   }),
    // });
    // const json = await response.json();
    //
    // log(json);

    const balanceAfter = await client.getAccountInfo({ accountId: 'relay' });
    console.log('relay balance after:', balanceAfter.balance.total.near);

    const aliceBalanceAfter = await client.getAccountInfo({ accountId: 'alice' });
    console.log('alice balance after:', aliceBalanceAfter.balance.total.near);
  });
});
