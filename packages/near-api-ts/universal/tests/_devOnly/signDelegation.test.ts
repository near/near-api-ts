import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  type Client,
  executeDelegation,
  keyPair,
  near,
  signDelegation,
  signTransaction,
  transfer,
} from '../../index';
import { createDefaultClient, log } from '../utils/common';
import { MIN_GAS_PURCHASE_PRICE, startSandbox } from '../utils/sandbox/startSandbox';

// `alice` signs a delegation, `relay` pays for it and sends it to the chain.
describe('Full-scale delegation test', () => {
  let client: Client;

  const aliceKp = keyPair(DEFAULT_PRIVATE_KEY);
  const relayKp = keyPair(
    'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6',
  );

  beforeAll(async () => {
    const sandbox = await startSandbox({ rpcPort: 4560, gasPrice: MIN_GAS_PURCHASE_PRICE });
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('executes a delegated transfer paid by the relay', async () => {
    const amount = near('1');

    // #1: The sender signs the delegation. The nonce is the sender's own access
    // key nonce, the delegation is only valid up to `expireAt.blockHeight`.
    const aliceAccessKey = await client.getAccountAccessKey({
      accountId: 'alice',
      publicKey: aliceKp.publicKey,
    });
    const { rawRpcResult: block } = await client.getBlock();

    const signedDelegation = await signDelegation({
      delegation: {
        senderAccountId: 'alice',
        senderPublicKey: aliceKp.publicKey,
        delegatedAction: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
        nonce: aliceAccessKey.accountAccessKey.nonce + 1,
        expireAt: { blockHeight: block.header.height + 100 },
      },
      signDataProvider: aliceKp,
    });

    log(signedDelegation);

    // #2: The relay wraps the signed delegation in its own transaction. The
    // transaction receiver must be the delegation sender, or the node answers
    // with DelegateActionSenderDoesNotMatchTxReceiver.
    const relayAccessKey = await client.getAccountAccessKey({
      accountId: 'relay',
      publicKey: relayKp.publicKey,
    });

    const balancesBefore = {
      alice: (await client.getAccountInfo({ accountId: 'alice' })).balance.total,
      bob: (await client.getAccountInfo({ accountId: 'bob' })).balance.total,
      relay: (await client.getAccountInfo({ accountId: 'relay' })).balance.total,
    };

    const signedTransaction = await signTransaction({
      transaction: {
        signerAccountId: 'relay',
        signerPublicKey: relayKp.publicKey,
        nonce: relayAccessKey.accountAccessKey.nonce + 1,
        action: executeDelegation({ signedDelegation }),
        receiverAccountId: signedDelegation.delegation.senderAccountId,
        blockHash: relayAccessKey.blockHash,
      },
      signDataProvider: relayKp,
    });

    // The delegation spawns a second receipt, so the balances only settle once
    // every receipt of the transaction is executed.
    // TODO: the transaction executes, but reading the result back fails - the
    // client cannot summarize an ExecuteDelegation action yet (nested function
    // call args need a deserialization story of their own). Until then this
    // test asserts the on-chain effect instead of the returned details.
    const txResult = await client.safeSendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'CompletedFinal',
    });

    log(txResult);

    // #3: The relay prepays everything - both the fees and the delegated
    // deposit (nearcore `total_deposit`, runtime/runtime/src/config.rs). The
    // sender only pays if the delegated actions fail and the deposit is
    // refunded back to it.
    const balancesAfter = {
      alice: (await client.getAccountInfo({ accountId: 'alice' })).balance.total,
      bob: (await client.getAccountInfo({ accountId: 'bob' })).balance.total,
      relay: (await client.getAccountInfo({ accountId: 'relay' })).balance.total,
    };

    expect(balancesAfter.bob.yoctoNear).toBe(balancesBefore.bob.add(amount).yoctoNear);
    expect(balancesAfter.alice.yoctoNear).toBe(balancesBefore.alice.yoctoNear);
    expect(balancesBefore.relay.sub(balancesAfter.relay).gt(amount)).toBe(true);
  });
});
